
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Load guide data once
guide_df = pd.read_csv('guidesdata.csv')
guides = guide_df.to_dict(orient='records')


@app.route('/guides', methods=['GET'])
def get_guides():
    destination = request.args.get('destination', '').lower()
    place = request.args.get('place', '').lower()

    filtered_guides = guides

    # Filter based on user query
    if destination:
        filtered_guides = [g for g in filtered_guides if destination in g['Destination'].lower()]
    if place:
        filtered_guides = [g for g in filtered_guides if place in g['Place'].lower()]

    # Group by guide name (or ID if you have one)
    grouped = {}
    for g in filtered_guides:
        guide_name = g['Guide Name'] if 'Guide Name' in g else g.get('Guide', 'Unknown')
        if guide_name not in grouped:
            
            grouped[guide_name] = {
                'Guide Name': guide_name,
                'Destination': g['Destination'],
                'Places': set(),  # use set to avoid duplicates
                'Phone Number': g.get('Phone Number', 'N/A'),
                'Languages Spoken': g.get("Languages Spoken"),  # Store as list
            }
        grouped[guide_name]['Places'].add(g['Place'])

    # Convert sets to lists for JSON serialization
    result = []
    for guide in grouped.values():
        guide['Places'] = list(guide['Places'])
        result.append(guide)


    return jsonify({'success': True, 'guides': result})


# ---- Booking and Route Guide logic remains the same ---- #

bookings = []
booked_guides_dates = {}

@app.route('/book-guide', methods=['POST'])
def book_guide():
    data = request.json
    guide_name = data.get('guide_name')
    user_name = data.get('user_name')
    user_contact = data.get('user_contact')
    trip_date = data.get('trip_date')

    if not guide_name or not user_name or not user_contact or not trip_date:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    if guide_name not in booked_guides_dates:
        booked_guides_dates[guide_name] = set()
    if trip_date in booked_guides_dates[guide_name]:
        return jsonify({"success": False, "error": "Guide already booked for that date"}), 409

    booked_guides_dates[guide_name].add(trip_date)

    booking = {
        'booking_id': len(bookings) + 1,
        'guide_name': guide_name,
        'user_name': user_name,
        'user_contact': user_contact,
        'trip_date': trip_date
    }

    bookings.append(booking)

    return jsonify({'success': True, 'booking': booking})


@app.route('/route-guide', methods=['GET'])
def get_route_guide():
    destination = request.args.get('destination', '').lower()
    possible_guides = [g for g in guides if destination in g['Destination'].lower()]
    assigned_guide = random.choice(possible_guides) if possible_guides else None

    if not assigned_guide:
        return jsonify({'success': False, 'error': 'No suitable route guide found'}), 404

    cost = 1000  # example cost
    return jsonify({'success': True, 'guide': assigned_guide, 'cost': cost})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
