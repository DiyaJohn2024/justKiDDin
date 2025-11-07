from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import firebase_admin
from firebase_admin import credentials, firestore
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import requests 
import json 


load_dotenv()


app = Flask(__name__)
CORS(app)


# Initialize Firebase
cred = credentials.Certificate('serviceAccount.json')
firebase_admin.initialize_app(cred)
db = firestore.client()


# Initialize Groq (MUCH FASTER than Gemini!)
groq_client = Groq(
    api_key=""
  # Replace with your Groq key
)
TICKETMASTER_API_KEY = ""   # Get from developer.ticketmaster.com
CALENDARIFIC_API_KEY = "" # Get from calendarific.com


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Backend running with Groq! ⚡'})


def extract_travel_entities(text):
    """
    Extract structured travel info from natural language using Grok.
    This feeds your friend's ML model!
    """
    prompt = f"""Extract travel-related entities from this text:
    "{text}"
    
    Return JSON with these fields (null if not mentioned):
    {{
      "destination": "city name",
      "duration": number of days,
      "budget": amount in INR,
      "interests": [list],
      "dates": "YYYY-MM-DD or null",
      "travelers": number,
      "accommodation_type": "hotel/hostel/resort or null"
    }}
    """
    
    response = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)


@app.route('/get-events', methods=['POST'])
def get_events():
    """
    Get concerts, sports, standup, festivals based on location & dates
    """
    data = request.json
    city = data.get('city', 'Mumbai')
    country_code = data.get('country_code', 'IN')  # India
    start_date = data.get('start_date')  # YYYY-MM-DD
    end_date = data.get('end_date')
    event_type = data.get('type', 'all')  # music, sports, comedy, all
    
    all_events = []
    
    # 1. Get Ticketmaster Events (Concerts, Sports, Comedy)
    try:
        tm_url = f"https://app.ticketmaster.com/discovery/v2/events.json"
        tm_params = {
            'apikey': TICKETMASTER_API_KEY,
            'city': city,
            'countryCode': country_code,
            'startDateTime': f"{start_date}T00:00:00Z",
            'endDateTime': f"{end_date}T23:59:59Z",
            'size': 20
        }
        
        if event_type != 'all':
            tm_params['classificationName'] = event_type  # music, sports, arts
        
        tm_response = requests.get(tm_url, params=tm_params, timeout=10)
        tm_data = tm_response.json()
        
        if '_embedded' in tm_data and 'events' in tm_data['_embedded']:
            for event in tm_data['_embedded']['events']:
                all_events.append({
                    'name': event.get('name'),
                    'type': event['classifications'][0]['segment']['name'],
                    'date': event['dates']['start'].get('localDate'),
                    'time': event['dates']['start'].get('localTime', 'TBA'),
                    'venue': event['_embedded']['venues'][0]['name'],
                    'location': f"{event['_embedded']['venues'][0]['city']['name']}, {event['_embedded']['venues'][0].get('address', {}).get('line1', '')}",
                    'ticket_url': event.get('url'),
                    'image': event['images'][0]['url'] if event.get('images') else None,
                    'price_range': event.get('priceRanges', [{}])[0] if event.get('priceRanges') else None,
                    'source': 'ticketmaster'
                })
    except Exception as e:
        print(f"Ticketmaster error: {e}")
    
    # 2. Get Religious Festivals
    try:
        cal_url = f"https://calendarific.com/api/v2/holidays"
        cal_params = {
            'api_key': CALENDARIFIC_API_KEY,
            'country': country_code,
            'year': datetime.strptime(start_date, '%Y-%m-%d').year,
            'type': 'religious,observance'
        }
        
        cal_response = requests.get(cal_url, params=cal_params, timeout=10)
        cal_data = cal_response.json()
        
        if cal_data.get('response') and 'holidays' in cal_data['response']:
            for holiday in cal_data['response']['holidays']:
                holiday_date = holiday['date']['iso']
                # Filter by date range
                if start_date <= holiday_date <= end_date:
                    all_events.append({
                        'name': holiday['name'],
                        'type': 'Religious Festival',
                        'date': holiday_date,
                        'time': 'All Day',
                        'venue': 'Various Locations',
                        'location': f"{city}, {country_code}",
                        'description': holiday.get('description', ''),
                        'source': 'calendarific'
                    })
    except Exception as e:
        print(f"Calendarific error: {e}")
    
    # 3. Get Weather-Based Trending Spots (using AI)
    try:
        # Call weather API
        weather_url = f"https://api.open-meteo.com/v1/forecast"
        weather_params = {
            'latitude': 12.9716,  # Example: Bangalore
            'longitude': 77.5946,
            'current': 'temperature_2m',
            'daily': 'temperature_2m_max,temperature_2m_min'
        }
        
        weather_response = requests.get(weather_url, params=weather_params, timeout=10)
        weather_data = weather_response.json()
        
        current_temp = weather_data['current']['temperature_2m']
        
        # Use Groq to suggest trending spots based on weather
        weather_prompt = f"""Based on current weather in {city} ({current_temp}°C), suggest 3 trending outdoor spots that would be popular right now. 
        
        Return JSON array:
        [
          {{
            "name": "Nandi Hills",
            "type": "Trending Spot",
            "reason": "Cool weather perfect for sunrise trek",
            "best_time": "Early morning"
          }}
        ]
        """
        
        groq_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": weather_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        trending_spots = json.loads(groq_response.choices[0].message.content)
        
        for spot in trending_spots.get('spots', []):
            all_events.append({
                'name': spot['name'],
                'type': 'Trending Location',
                'date': start_date,
                'time': spot.get('best_time', 'Flexible'),
                'venue': spot['name'],
                'location': f"{city}",
                'description': spot.get('reason', ''),
                'weather': f"{current_temp}°C",
                'source': 'ai_weather'
            })
    except Exception as e:
        print(f"Weather/trending error: {e}")
    
    # Sort by date
    all_events.sort(key=lambda x: x.get('date', '9999-12-31'))
    
    return jsonify({
        'success': True,
        'total_events': len(all_events),
        'events': all_events,
        'city': city,
        'date_range': f"{start_date} to {end_date}"
    })

@app.route('/check-safety-alerts', methods=['POST'])
def check_safety_alerts():
    """
    Check weather conditions, natural disasters, and travel safety
    for a destination. Provides human-centric warnings.
    """
    data = request.json
    destination = data.get('destination')
    city = data.get('city')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    all_alerts = []
    safety_score = 100  # Start at 100, deduct for issues
    
    # 1. Get detailed weather forecast
    try:
        # Weather API (Open-Meteo - Free & Accurate)
        weather_url = "https://api.open-meteo.com/v1/forecast"
        
        # Get coordinates for city (you can use a geocoding API or hardcode common cities)
        city_coords = {
            'mumbai': {'lat': 19.0760, 'lon': 72.8777},
            'delhi': {'lat': 28.6139, 'lon': 77.2090},
            'bangalore': {'lat': 12.9716, 'lon': 77.5946},
            'goa': {'lat': 15.2993, 'lon': 74.1240},
            'jaipur': {'lat': 26.9124, 'lon': 75.7873},
            'kerala': {'lat': 10.8505, 'lon': 76.2711},
            'manali': {'lat': 32.2432, 'lon': 77.1892},
            'shimla': {'lat': 31.1048, 'lon': 77.1734}
        }
        
        coords = city_coords.get(city.lower(), city_coords['mumbai'])
        
        weather_params = {
            'latitude': coords['lat'],
            'longitude': coords['lon'],
            'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode',
            'timezone': 'Asia/Kolkata',
            'start_date': start_date,
            'end_date': end_date
        }
        
        weather_response = requests.get(weather_url, params=weather_params, timeout=10)
        weather_data = weather_response.json()
        
        # Analyze weather for alerts
        daily = weather_data.get('daily', {})
        precipitation = daily.get('precipitation_sum', [])
        wind_speed = daily.get('windspeed_10m_max', [])
        weather_codes = daily.get('weathercode', [])
        
        for i, precip in enumerate(precipitation):
            date = daily['time'][i]
            
            # Heavy rain alert
            if precip > 50:  # More than 50mm
                all_alerts.append({
                    'type': 'severe_weather',
                    'severity': 'high',
                    'title': '⛈️ Heavy Rain Warning',
                    'message': f"Heavy rainfall expected on {date} ({precip}mm). Risk of flooding in low-lying areas.",
                    'action': 'Carry raincoat, avoid outdoor activities, check local flood alerts.',
                    'date': date
                })
                safety_score -= 15
            
            elif precip > 20:  # Moderate rain
                all_alerts.append({
                    'type': 'weather',
                    'severity': 'medium',
                    'title': '🌧️ Rainy Day',
                    'message': f"Moderate rain expected on {date} ({precip}mm).",
                    'action': 'Pack umbrella and waterproof bags.',
                    'date': date
                })
                safety_score -= 5
            
            # Strong wind alert
            if wind_speed[i] > 40:  # km/h
                all_alerts.append({
                    'type': 'severe_weather',
                    'severity': 'high',
                    'title': '💨 Strong Wind Warning',
                    'message': f"High winds expected on {date} (up to {wind_speed[i]} km/h).",
                    'action': 'Avoid beach activities, secure loose items, be cautious on roads.',
                    'date': date
                })
                safety_score -= 10
            
            # Thunderstorm detection (weather code 95-99)
            if weather_codes[i] >= 95:
                all_alerts.append({
                    'type': 'severe_weather',
                    'severity': 'critical',
                    'title': '⚡ Thunderstorm Alert',
                    'message': f"Thunderstorms expected on {date}. Lightning risk.",
                    'action': 'Stay indoors during storms, avoid open areas, unplug electronics.',
                    'date': date
                })
                safety_score -= 20
        
    except Exception as e:
        print(f"Weather API error: {e}")
    
    # 2. Use AI to check for natural disasters and travel advisories
    try:
        disaster_prompt = f"""Check current natural disaster risks and travel advisories for {destination}, India for dates {start_date} to {end_date}.

Consider:
- Recent earthquakes, landslides, floods
- Cyclone/storm warnings
- Political unrest or safety concerns
- Disease outbreaks
- Road closures

Return JSON:
{{
  "disasters": [
    {{
      "type": "earthquake/flood/landslide/cyclone/none",
      "severity": "low/medium/high/critical",
      "description": "Brief description",
      "date": "when it occurred or expected",
      "affected_areas": ["area1", "area2"]
    }}
  ],
  "travel_advisory": {{
    "level": "safe/caution/avoid",
    "reason": "explanation",
    "recommendations": ["tip1", "tip2"]
  }},
  "health_alerts": ["any disease outbreaks or health concerns"],
  "general_safety_tips": ["tip1", "tip2", "tip3"]
}}

If no major concerns, return empty arrays but include general safety tips.
"""
        
        ai_response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a travel safety expert providing real-time risk assessments."
                },
                {
                    "role": "user",
                    "content": disaster_prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,  # Lower for factual accuracy
            response_format={"type": "json_object"}
        )
        
        safety_data = json.loads(ai_response.choices[0].message.content)
        
        # Process disaster alerts
        for disaster in safety_data.get('disasters', []):
            if disaster['type'] != 'none':
                severity_impact = {
                    'low': 5,
                    'medium': 15,
                    'high': 30,
                    'critical': 50
                }
                
                all_alerts.append({
                    'type': 'natural_disaster',
                    'severity': disaster['severity'],
                    'title': f"🚨 {disaster['type'].title()} Alert",
                    'message': disaster['description'],
                    'action': f"Monitor local news, follow evacuation orders if issued. Affected areas: {', '.join(disaster.get('affected_areas', ['Unknown']))}",
                    'date': disaster.get('date', 'Ongoing')
                })
                
                safety_score -= severity_impact.get(disaster['severity'], 10)
        
        # Travel advisory
        advisory = safety_data.get('travel_advisory', {})
        if advisory.get('level') == 'avoid':
            all_alerts.append({
                'type': 'travel_advisory',
                'severity': 'critical',
                'title': '⛔ Travel Not Recommended',
                'message': advisory.get('reason', 'Safety concerns'),
                'action': 'Consider postponing trip or choosing alternative destination.'
            })
            safety_score -= 40
        elif advisory.get('level') == 'caution':
            all_alerts.append({
                'type': 'travel_advisory',
                'severity': 'medium',
                'title': '⚠️ Exercise Caution',
                'message': advisory.get('reason', 'Minor safety concerns'),
                'action': ', '.join(advisory.get('recommendations', ['Stay alert']))
            })
            safety_score -= 10
        
        # Health alerts
        for health_alert in safety_data.get('health_alerts', []):
            all_alerts.append({
                'type': 'health',
                'severity': 'medium',
                'title': '🏥 Health Advisory',
                'message': health_alert,
                'action': 'Carry necessary medications, get vaccinations if needed.'
            })
            safety_score -= 5
        
        general_tips = safety_data.get('general_safety_tips', [])
        
    except Exception as e:
        print(f"AI safety check error: {e}")
        general_tips = [
            "Keep emergency numbers handy",
            "Share itinerary with family",
            "Have travel insurance"
        ]
    
    # 3. Best time to visit recommendation
    best_time_advice = ""
    if safety_score < 50:
        best_time_advice = "⚠️ Current conditions are not ideal. Consider rescheduling your trip."
    elif safety_score < 70:
        best_time_advice = "⚡ Weather conditions may affect your plans. Stay flexible and monitor updates."
    else:
        best_time_advice = "✅ Conditions look good for travel! Have a safe trip."
    
    # Sort alerts by severity
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    all_alerts.sort(key=lambda x: severity_order.get(x.get('severity', 'low'), 3))
    
    return jsonify({
        'success': True,
        'destination': destination,
        'date_range': f"{start_date} to {end_date}",
        'safety_score': max(0, safety_score),  # 0-100
        'safety_rating': 'Safe' if safety_score >= 80 else 'Caution' if safety_score >= 60 else 'Risk',
        'alerts': all_alerts,
        'general_safety_tips': general_tips,
        'best_time_advice': best_time_advice,
        'alert_count': {
            'critical': len([a for a in all_alerts if a.get('severity') == 'critical']),
            'high': len([a for a in all_alerts if a.get('severity') == 'high']),
            'medium': len([a for a in all_alerts if a.get('severity') == 'medium']),
            'low': len([a for a in all_alerts if a.get('severity') == 'low'])
        }
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Conversational AI endpoint with user context.
    """
    data = request.json
    user_message = data.get('message', '')
    user_profile = data.get('user_profile', {})
    conversation_history = data.get('conversation_history', [])
    user_id = data.get('user_id')  
    
    # Build context-aware system prompt
    system_prompt = f"""You are a friendly, knowledgeable AI travel assistant. 


User Profile:
- Name: {user_profile.get('name', 'Traveler')}
- Interests: {', '.join(user_profile.get('interests', []))}
- Travel Style: {user_profile.get('travel_style', 'casual')}


Your personality:
- Conversational and warm
- Use emojis occasionally
- Give practical, actionable advice
- Remember their preferences in responses
- Be enthusiastic about travel


When they ask about destinations, consider their interests. When discussing budgets, align with their style."""


    # Build conversation messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history (last 5 messages for context)
    for msg in conversation_history[-5:]:
        messages.append({
            "role": msg.get('role'),
            "content": msg.get('content')
        })
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=512
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # SAVE TO FIREBASE
        if user_id:
            chat_ref = db.collection('chat_history').document(user_id).collection('messages')
            chat_ref.add({
                'role': 'user',
                'content': user_message,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            chat_ref.add({
                'role': 'assistant',
                'content': response_text,
                'timestamp': firestore.SERVER_TIMESTAMP
            })


            # EXTRACT ENTITIES
            extracted = extract_travel_entities(user_message)
            if extracted:
                db.collection('users').document(user_id).collection('search_history').add({
                    'destination': extracted.get('destination'),
                    'duration': extracted.get('duration'),
                    'budget': extracted.get('budget'),
                    'interests': extracted.get('interests'),
                    'timestamp': firestore.SERVER_TIMESTAMP
                })


        return jsonify({'success': True, 'response': response_text})


    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
 


@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    destination = data.get('destination')
    duration = data.get('duration')
    budget = data.get('budget')
    interests = data.get('interests', [])
    traveler_type = data.get('traveler_type', 'solo')
    user_id = data.get('user_id')
    start_date = data.get('start_date')  # ← ADD THIS (get from frontend)
    
    # Get user's past search history for incremental learning
    past_searches_context = ""
    if user_id:
        try:
            history_ref = db.collection('users').document(user_id).collection('search_history')
            history = history_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(3).stream()
            past_searches = [doc.to_dict() for doc in history]
            
            if past_searches:
                past_searches_context = "\n\n📊 User's Travel History:\n"
                for search in past_searches:
                    dest = search.get('destination', 'Unknown')
                    past_budget = search.get('budget', 'N/A')
                    past_searches_context += f"- Previously searched: {dest} (Budget: ₹{past_budget})\n"
                past_searches_context += "\nUse this to personalize recommendations based on their preferences.\n"
        except Exception as e:
            print(f"Could not fetch history: {e}")
            past_searches_context = ""
    
    # Generate itinerary prompt
    prompt = f"""Create a detailed {duration}-day travel itinerary for {destination}.

User Profile:
- Budget: ₹{budget}
- Interests: {', '.join(interests)}
- Traveler Type: {traveler_type}
{past_searches_context}

Include:
1. Day-wise schedule with timings (morning, afternoon, evening)
2. Mix of popular attractions AND hidden local gems
3. Street food spots and authentic local restaurants (not just chains)
4. Local transport details (specific bus numbers, metro routes, auto rickshaw fares)
5. Budget accommodation options (hostels for students, mid-range for families)
6. Daily cost breakdown (transport, food, activities, accommodation)
7. Best times to visit each place to avoid crowds
8. Safety tips and local etiquette

**IMPORTANT**: Clearly mention specific famous places/attractions by name.

Format it clearly with headers for each day. Make it practical, realistic, and budget-friendly for Indian travelers.
"""
    
    try:
        # ===== STEP 1: Generate itinerary =====
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert Indian travel planner who creates detailed, practical, and budget-friendly itineraries."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.8,
            max_tokens=4096
        )
        
        itinerary_text = chat_completion.choices[0].message.content
        
        # ===== STEP 2: Extract famous places from itinerary =====
        extract_places_prompt = f"""From this itinerary, extract all famous places/attractions mentioned:

{itinerary_text}

Return ONLY a JSON object with format:
{{
  "places": ["Place 1", "Place 2", "Place 3"]
}}

Extract specific attraction names, monuments, temples, beaches, etc. mentioned in the itinerary.
"""
        
        places_response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": extract_places_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        places_data = json.loads(places_response.choices[0].message.content)
        famous_places = places_data.get('places', [])
        
        print(f"✅ Extracted famous places: {famous_places}")
        
        # ===== STEP 3: Get hotel recommendations from ML model =====
        hotels = []
        try:
            ml_response = requests.post('http://localhost:5001/recommend-hotels', 
                json={
                    'destination': destination,
                    'budget': budget,
                    'famous_places': famous_places,
                    'user_preferences': {
                        'past_accommodation_types': []
                    }
                },
                timeout=10
            )
            
            if ml_response.status_code == 200:
                ml_data = ml_response.json()
                hotels = ml_data.get('hotels', [])
                print(f"✅ Got {len(hotels)} hotel recommendations from ML model")
            else:
                print(f"⚠️ ML model returned status {ml_response.status_code}")
        except requests.exceptions.ConnectionError:
            print("⚠️ ML service not running on port 5001. Skipping hotels.")
        except Exception as e:
            print(f"⚠️ Hotel recommendation error: {e}")
        
        # ===== STEP 4: CHECK SAFETY ALERTS (NEW!) =====
        safety_alerts = []
        safety_score = 100
        best_time_advice = "✅ Conditions look good for travel!"
        
        # Calculate end date
        if start_date:
            from datetime import datetime, timedelta
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = start_dt + timedelta(days=duration)
                end_date = end_dt.strftime('%Y-%m-%d')
                
                # Call safety check endpoint
                safety_check = requests.post('http://localhost:5000/check-safety-alerts', 
                    json={
                        'destination': destination,
                        'city': destination,
                        'start_date': start_date,
                        'end_date': end_date
                    },
                    timeout=15
                )
                
                if safety_check.status_code == 200:
                    safety_data = safety_check.json()
                    safety_alerts = safety_data.get('alerts', [])
                    safety_score = safety_data.get('safety_score', 100)
                    best_time_advice = safety_data.get('best_time_advice', best_time_advice)
                    print(f"✅ Safety check complete: Score {safety_score}, {len(safety_alerts)} alerts")
                else:
                    print(f"⚠️ Safety check returned status {safety_check.status_code}")
            except Exception as e:
                print(f"⚠️ Safety check error: {e}")
        else:
            print("⚠️ No start date provided, skipping safety check")
        
        # ===== STEP 5: Save search history =====
        if user_id:
            try:
                db.collection('users').document(user_id).collection('search_history').add({
                    'destination': destination,
                    'duration': duration,
                    'budget': budget,
                    'interests': interests,
                    'traveler_type': traveler_type,
                    'famous_places': famous_places,
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'search_type': 'itinerary_generation'
                })
            except Exception as e:
                print(f"Could not save search history: {e}")
        
        # ===== STEP 6: Return everything INCLUDING SAFETY DATA =====
        return jsonify({
            'success': True,
            'itinerary': itinerary_text,
            'destination': destination,
            'duration': duration,
            'famous_places': famous_places,
            'hotels': hotels,
            'hotels_count': len(hotels),
            'safety_alerts': safety_alerts,        # ← NEW
            'safety_score': safety_score,          # ← NEW
            'best_time_advice': best_time_advice   # ← NEW
        })
        
    except Exception as e:
        print(f"❌ Itinerary generation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@app.route('/recommend-guides', methods=['POST'])
def recommend_guides():
    data = request.json
    city = data.get('city')
    interests = data.get('interests', [])
    
    try:
        # Query guides in that city
        guides_ref = db.collection('guides').where('city', '==', city).where('available', '==', True)
        guides = [doc.to_dict() for doc in guides_ref.stream()]
        
        # Score by matching specialties
        for guide in guides:
            match_count = len(set(guide['specialties']).intersection(set(interests)))
            guide['match_score'] = match_count
        
        # Sort by match score and rating
        guides.sort(key=lambda x: (x['match_score'], x['rating']), reverse=True)
        
        return jsonify({
            'success': True,
            'guides': guides[:3]  # Top 3
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/analyze-preferences', methods=['POST'])
def analyze_preferences():
    """
    Extract travel preferences from natural language using Groq.
    This is your NLP magic! 🪄
    """
    data = request.json
    user_input = data.get('user_input', '')
    
    # Detailed prompt for preference extraction
    prompt = f"""Analyze the following text about a traveler and extract their preferences.


User's description: "{user_input}"


Extract and return a JSON object with these fields:
{{
  "interests": [list of travel interests like "beach", "adventure", "food", "culture", "nature", "nightlife", "history", "photography"],
  "travel_style": one of ["budget", "luxury", "mid-range", "backpacker", "comfort"],
  "budget_level": one of ["low", "medium", "high"],
  "pace": one of ["relaxed", "moderate", "fast-paced"],
  "social_preference": one of ["solo", "couple", "family", "group"],
  "personality_traits": [list like "adventurous", "foodie", "relaxed", "explorer", "culture-lover", "party-goer", "nature-lover"],
  "avoids": [list of things they dislike, like "crowds", "touristy spots", "expensive places"],
  "accommodation_preference": one of ["hostel", "hotel", "airbnb", "resort", "guesthouse"],
  "summary": a 1-sentence summary of their travel personality
}}


Be intelligent and infer from context. If they say "budget-friendly", set budget_level to "low". If they mention "street food", add "food" to interests and "foodie" to personality_traits.
"""
    
    try:
        # Use Groq with JSON mode for structured output
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert travel psychologist who extracts detailed preferences from user descriptions. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,  # Lower for more consistent extraction
            response_format={"type": "json_object"}  # Force JSON output!
        )
        
        # Parse the JSON response
        preferences = json.loads(chat_completion.choices[0].message.content)
        
        return jsonify({
            'success': True,
            'preferences': preferences
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/extract-trip-details', methods=['POST'])
def extract_trip_details():
    """
    AI-powered understanding - handles vague, incomplete, or complex inputs
    Smarter than analyze-preferences - actually suggests destinations!
    """
    data = request.json
    user_input = data.get('text', '')
    user_profile = data.get('user_profile', {})
    
    # SMART PROMPT - Let AI think and suggest
    prompt = f"""You are a travel planning assistant. A user said:


"{user_input}"


Their profile shows they like: {', '.join(user_profile.get('interests', ['general travel']))}
Their usual travel style: {user_profile.get('travel_style', 'casual')}


Analyze their request intelligently:


1. If they mentioned a destination, extract it
2. If they didn't mention destination, suggest 3 destinations based on their interests
3. Understand intent even if vague ("want to chill" = relaxed trip, "adventure" = trekking/activities)
4. Guess duration from context ("weekend" = 2-3 days, "week" = 7 days, "vacation" = 5-7 days)
5. Estimate budget from cues ("cheap" = 15000, "moderate" = 30000, "luxury" = 60000+)
6. Understand dates ("next month" = first week of next month, "December" = early December)


Return JSON:
{{
  "destination": "city name or null",
  "destination_confidence": "high/medium/low",
  "suggested_destinations": ["option1", "option2", "option3"] if no destination,
  "duration": number of days or your best guess,
  "budget": amount in INR or your estimate,
  "start_date": "YYYY-MM-DD" or null,
  "interests": [extracted interests from text],
  "vibe": "relaxed/adventure/cultural/party/family/romantic",
  "traveler_type": "solo/couple/family/friends",
  "missing_info": ["what you need to ask user"],
  "ai_interpretation": "summary of what you understood in friendly language"
}}


Be conversational and helpful. Make intelligent guesses based on context.
"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an empathetic travel assistant who understands vague requests and helps clarify plans through intelligent interpretation."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.7,  # Higher for more creative interpretation
            response_format={"type": "json_object"}
        )
        
        extracted = json.loads(response.choices[0].message.content)
        
        return jsonify({
            'success': True,
            'extracted': extracted,
            'interpretation': extracted.get('ai_interpretation', '')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)
