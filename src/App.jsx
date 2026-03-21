import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Content Filter ────────────────────────────────────────────────────────────
const PROFANITY = ["spam","scam","xxx","porn","casino","viagra"];
function runContentFilter(trip) {
  const text = JSON.stringify(trip).toLowerCase();
  const flags = [];
  PROFANITY.forEach(w => { if (text.includes(w)) flags.push('Contains flagged word: ' + w); });
  if ((text.match(/http/g)||[]).length > 2) flags.push("Multiple URLs detected");
  if (!trip.title || trip.title.length < 5) flags.push("Trip title too short");
  if (!trip.loves || trip.loves.length < 20) flags.push("What you loved section too brief");
  if (text.length < 200) flags.push("Submission content too thin");
  const lv = (trip.loves||"").replace(/[^A-Za-z]/g,"");
  const capsRatio = lv.split("").filter(c=>c===c.toUpperCase()&&c!==c.toLowerCase()).length / Math.max(lv.length,1);
  if (capsRatio > 0.6 && lv.length > 20) flags.push("Excessive capitals detected");
  return { passed: flags.length === 0, flags };
}

// ── Warm Nomad Design Tokens ─────────────────────────────────────────────────
// Primary:   Deep Navy    #1C2B3A  (headings, nav text, hero type)
// Secondary: Warm Sand    #C4A882  (CTA buttons, accents)
// Surface:   Cream        #FAF7F2  (page bg)
// Card:      Off-White    #FFFFFF  (card bg)
// Border:    Linen        #E8DDD0  (borders, dividers)
// Accent:    Terracotta   #C1692A  (tags, highlights)
// Font:      Playfair Display (display) + Nunito (body)

const C = {
  azure:       "#C4A882",
  azureDeep:   "#A8896A",
  azureDark:   "#1C2B3A",
  cerulean:    "#1C2B3A",
  sand:        "#F0E8DC",
  sandDeep:    "#E8DDD0",
  sandBorder:  "#D4C4B0",
  seafoam:     "#FAF7F2",
  seafoamDeep: "#F0E8DC",
  white:       "#FFFFFF",
  tide:        "#E8DDD0",
  tideDeep:    "#D4C4B0",
  slate:       "#1C2B3A",
  slateMid:    "#3D2B1F",
  slateLight:  "#6B4F3A",
  muted:       "#A89080",
  mutedLight:  "#C4AFA0",
  green:       "#7A9E5A",
  greenBg:     "#EEF5E8",
  amber:       "#C1692A",
  amberBg:     "#FDF0E6",
  red:         "#B03A2E",
  redBg:       "#FDECEA",
  cta:         "#C4A882",
  ctaText:     "#1C2B3A",
  ctaHover:    "#A8896A",
};

const SAMPLE_TRIPS = [
  {
    id: 1, title: "Scotland with Kids — Edinburgh & Perthshire", destination: "Edinburgh & Perthshire, Scotland", region: "Europe", image: "/victoria-street.jpg",
    author: "Andrew M.", date: "May 2025", duration: "9 days", travelers: "Family (young kids)",
    tags: ["family-friendly", "culture", "scenic drives"],
    loves: "The Perthshire farm stay at Pitmeadow Farm is the undisputed highlight — collecting eggs, walking ponies, feeding pigs. Our kids call this their favourite trip ever. Edinburgh has incredible character and is completely walkable. St Andrews on a Sunday when the Old Course is open as a public park is a magical free experience. The Kirkstyle Inn is the kind of local pub you dream about finding.",
    doNext: "Some Edinburgh pubs don't allow children — call ahead before walking in with kids. Would spend an extra night at Pitmeadow Farm — four nights wasn't enough. The Oban/Glencoe loop is long for one day; consider breaking it with a stop.",
    airfare: [{ item: "United CLE → EDI", detail: "~$742/person", tip: "Direct or one-stop via London. Book well in advance — transatlantic Scotland routes fill fast in spring." }],
    hotels: [
      { item: "Airbnb — 31-2 Brunswick Rd, Edinburgh EH7 5GW", detail: "4 nights, Edinburgh", tip: "Great base in Leith area — walkable to Royal Mile, good neighbourhood feel, family-sized." },
      { item: "Pitmeadow Farm, Perthshire", detail: "4 nights, farm stay", tip: "Cannot recommend highly enough. Book as far in advance as possible. Kids collect eggs, walk ponies, feed pigs. Read every review — they're all true." },
    ],
    restaurants: [
      { item: "The Kirkstyle Inn, Perthshire", detail: "Pub meals, ~£15-20/person", tip: "Went multiple times. Wonderful atmosphere, great food, welcoming to families. The kind of pub you move to a village to be near." },
      { item: "Edinburgh pub dining", detail: "~£15-25/person", tip: "Check child policy before arriving — several pubs in the Old Town don't admit children. Ask when booking." },
    ],
    bars: [
      { item: "The Kirkstyle Inn", detail: "Local ales, ~£5-6/pint", tip: "The best local pub of the trip. Go for dinner, stay for drinks." },
    ],
    activities: [
      { item: "Edinburgh Castle", detail: "~£18/adult, £11/child", tip: "Book online to skip queues. Allow 2-3 hours. The Crown Jewels are the highlight for kids." },
      { item: "Palace of Holyroodhouse", detail: "~£17/adult, £10/child", tip: "Less crowded than the Castle. Fascinating history and beautiful grounds. Worth pairing on the same day as the Royal Mile walk." },
      { item: "St Andrews Old Course (Sunday walk)", detail: "Free", tip: "On Sundays the Old Course opens as a public park — anyone can walk it. Completely free and genuinely special. Kids loved it. Go in the morning." },
      { item: "Stirling Castle", detail: "~£16/adult, £9.60/child", tip: "Perfect stop en route from Edinburgh to Perthshire. Allow 2 hours. Better value than Edinburgh Castle, less crowded." },
      { item: "Oban & Glencoe Road Trip", detail: "Full day drive", tip: "One of the great scenic drives in Europe. Glencoe is jaw-dropping. Oban has excellent fish and chips on the harbour. Long day — start early." },
      { item: "Dunkeld Village Day Trip", detail: "Free to explore", tip: "Charming cathedral town 20 mins from Pitmeadow. Walk the river path, browse the high street. Pairs well with a Pitlochry stop." },
      { item: "Pitlochry Day Trip", detail: "Free to explore", tip: "Classic Perthshire market town. Whisky distillery, dam and fish ladder, easy walking. Good for a half day." },
    ],
    days: [
      { day: 1, date: "May 2", title: "Arrival — Edinburgh", items: [
        { time: "Afternoon", type: "hotel", label: "Check in — Brunswick Rd Airbnb, Edinburgh", note: "Leith area — settle in, get oriented." },
        { time: "Evening", type: "activity", label: "Explore Leith & the waterfront", note: "Low-key first evening. Walk down to the Shore for dinner." },
      ]},
      { day: 2, date: "May 3", title: "Edinburgh — Castle & Royal Mile", items: [
        { time: "9:00 AM", type: "activity", label: "Edinburgh Castle", note: "Book online. Go early before the tour groups arrive." },
        { time: "12:30 PM", type: "restaurant", label: "Lunch on the Royal Mile", note: "Plenty of options. Check child policies if doing a pub." },
        { time: "2:00 PM", type: "activity", label: "Walk the Royal Mile down to Holyrood", note: "Take your time — every close and alley is worth exploring." },
      ]},
      { day: 3, date: "May 4", title: "Holyroodhouse & City", items: [
        { time: "10:00 AM", type: "activity", label: "Palace of Holyroodhouse", note: "Less crowded than the Castle. Great for kids — fascinating rooms." },
        { time: "1:00 PM", type: "restaurant", label: "Lunch in Edinburgh city centre", note: "Call ahead to any pub to check child policy." },
        { time: "3:00 PM", type: "activity", label: "Arthur's Seat or Calton Hill", note: "Easy afternoon walk with big views." },
      ]},
      { day: 4, date: "May 5", title: "St Andrews Day Trip", items: [
        { time: "9:00 AM", type: "transport", label: "Rent a car — drive to St Andrews (1hr)", note: "Sunday is the key day — Old Course is open to the public as a park." },
        { time: "11:00 AM", type: "activity", label: "Walk the Old Course, St Andrews", note: "Completely free on Sundays. Genuinely special. Kids can run the fairways." },
        { time: "1:00 PM", type: "restaurant", label: "Lunch in St Andrews town", note: "Lovely coastal town. Walk the castle ruins and cathedral." },
        { time: "4:00 PM", type: "transport", label: "Drive back to Edinburgh", note: "Easy 1hr return." },
      ]},
      { day: 5, date: "May 6", title: "Stirling Castle → Perthshire Farm", items: [
        { time: "9:30 AM", type: "transport", label: "Check out Edinburgh — drive to Stirling", note: "45 mins from Edinburgh." },
        { time: "10:30 AM", type: "activity", label: "Stirling Castle", note: "Brilliant castle, less crowded than Edinburgh. Allow 2 hours." },
        { time: "1:30 PM", type: "transport", label: "Drive to Pitmeadow Farm, Perthshire", note: "40 mins from Stirling. Arrival at the farm is a moment." },
        { time: "3:00 PM", type: "hotel", label: "Check in — Pitmeadow Farm", note: "Meet your hosts. Kids immediately want to see the animals." },
        { time: "Evening", type: "bar", label: "Dinner at The Kirkstyle Inn", note: "Your new local. Book a table." },
      ]},
      { day: 6, date: "May 7", title: "Oban & Glencoe Road Trip", items: [
        { time: "8:00 AM", type: "transport", label: "Early start — drive toward Glencoe", note: "Long day. Glencoe is 1.5hrs from Pitmeadow." },
        { time: "10:00 AM", type: "activity", label: "Glencoe Valley", note: "Stop and walk. One of the most dramatic landscapes in Europe." },
        { time: "1:00 PM", type: "restaurant", label: "Fish & chips on Oban harbour", note: "Classic. Eat outside looking at the bay." },
        { time: "2:30 PM", type: "activity", label: "Oban town & McCaig's Tower", note: "Short walk up to the tower for panoramic views." },
        { time: "5:00 PM", type: "transport", label: "Drive back to Pitmeadow Farm", note: "1.5hr return. Scenic all the way." },
      ]},
      { day: 7, date: "May 8", title: "Dunkeld & Farm Day", items: [
        { time: "Morning", type: "activity", label: "Farm morning — eggs, ponies, pigs", note: "Let the kids lead. This is the memory they'll talk about for years." },
        { time: "11:30 AM", type: "activity", label: "Dunkeld village & cathedral", note: "20 mins away. Walk the river path. Beautiful and peaceful." },
        { time: "1:30 PM", type: "restaurant", label: "Lunch in Dunkeld", note: "Small selection of good cafes and pubs in the village." },
        { time: "Evening", type: "bar", label: "The Kirkstyle Inn", note: "Go again. You won't regret it." },
      ]},
      { day: 8, date: "May 9", title: "Pitlochry Day Trip", items: [
        { time: "10:00 AM", type: "activity", label: "Pitlochry — dam, fish ladder & distillery", note: "30 mins from Pitmeadow. Fish ladder is fascinating for kids." },
        { time: "12:30 PM", type: "restaurant", label: "Lunch in Pitlochry", note: "Good range of cafes on the high street." },
        { time: "2:30 PM", type: "activity", label: "Blair Athol Distillery tour", note: "One of Scotland's oldest. Family-friendly — kids get juice while adults do the tasting." },
        { time: "Evening", type: "activity", label: "Final evening at the farm", note: "Soak it in. Say goodbye to the animals." },
      ]},
      { day: 9, date: "May 10", title: "Departure Day", items: [
        { time: "Morning", type: "activity", label: "Last farm morning", note: "One more round of egg collecting if you can manage it." },
        { time: "Midday", type: "transport", label: "Drive to Edinburgh Airport", note: "Allow 1.5hrs from Perthshire to EDI. Return rental car." },
      ]},
    ]
  },
  {
    id: 2, title: "Ireland Guys Trip — Galway & Dublin", destination: "Galway & Dublin, Ireland", region: "Europe", image: "/bowes.webp",
    author: "Andrew M.", date: "2025", duration: "4 days", travelers: "Guys trip",
    tags: ["food & wine", "culture", "adventure"],
    loves: "Sean's Bar is a mandatory stop — opens at 10:30am and there is no better way to start an Ireland trip. Bowe's consistently pours the best pint in Dublin. The trad session at the Crane Bar in Galway is the real thing. Mister S for dinner in Dublin is outstanding — book well ahead. Universal Bar in Galway exceeded all expectations. Stonybatter pub crawl is the highlight of Dublin.",
    doNext: "Galway is great but next time would swap one night for a smaller charming town — Westport, Killarney or Doolin. The Cliffs of Moher day trip is worth it but commits half your group to an early morning. Gravediggers is worth the Uber both days.",
    airfare: [{ item: "United CLE → DUB (nonstop)", detail: "~$430/person", tip: "Nonstop Cleveland to Dublin is exceptional value. Book early — this route fills fast and the price jumps significantly." }],
    hotels: [
      { item: "The Residence Hotel, Galway", detail: "2 nights, Galway city centre", tip: "Central location, walkable to everything on the pub crawl. Check in at 3pm — use the morning for Sean's Bar and the drive west." },
      { item: "Trinity City Hotel, Dublin", detail: "1 night, Dublin city centre", tip: "Well located for the Dublin pub circuit. Uber from Gravediggers on arrival, walk everywhere else." },
    ],
    restaurants: [
      { item: "Universal Bar, Galway", detail: "Dinner, ~€30-40pp", tip: "Outstanding food. Book for 6:30pm — the sweet spot before it fills. First choice every time." },
      { item: "Mister S, Dublin", detail: "Dinner, ~€40-50pp", tip: "Book the 9:15pm slot well in advance — this place is in demand. One of the best meals of the trip." },
      { item: "Ard Bia at Nimmos, Galway", detail: "Lunch or dinner, ~€25-35pp", tip: "Brilliant spot by the Spanish Arch. Best for lunch — atmospheric and unhurried." },
      { item: "Matt's Sandwiches, Galway", detail: "~€8-10", tip: "Grab sandwiches here before the drive to Dublin on Saturday morning. Best road food decision you'll make." },
      { item: "Elephant & Castle, Dublin", detail: "~€15-20pp", tip: "Wings are the move. Perfect quick bite right after Bowe's before the evening proper begins." },
      { item: "Munch Haven / Charcoal Grill, Galway", detail: "Late night, ~€10-15", tip: "Open till 3am. Essential late-night insurance after the Galway pub crawl." },
      { item: "Zaytoon, Dublin", detail: "Late night kebabs, ~€10", tip: "The classic Dublin end-of-night. On Parliament Street. Non-negotiable after the Long Hall or Kehoe's." },
    ],
    bars: [
      { item: "Sean's Bar, Athlone", detail: "Pint ~€6", tip: "Oldest pub in Ireland. Opens 10:30am — hit it on the drive from Dublin airport to Galway. Order the Guinness, get a bite, take your time. Non-negotiable start to the trip." },
      { item: "Bowe's, Dublin", detail: "Pint ~€6", tip: "Consistently the best pint in Dublin. No frills, no pretension. Go early evening before it fills. Anchor your Dublin afternoon here." },
      { item: "Crane Bar, Galway", detail: "Pint ~€6", tip: "The trad session here is the real thing — not a tourist performance. Arrive early to get a spot. Thursday night is ideal." },
      { item: "Tigh Neachtain, Galway", detail: "Pint ~€6", tip: "First stop in Galway after dropping bags. Classic atmospheric pub, good outdoor benches on the corner. Sets the tone for the whole trip." },
      { item: "Gravediggers (John Kavanagh's), Dublin", detail: "Pint ~€6", tip: "Worth the Uber both days — Saturday arrival and Sunday opening pint. One of Dublin's truly great pubs. Unchanged for 150 years." },
      { item: "Mulligan's, Dublin", detail: "Pint ~€6", tip: "Legendary Dublin pub. Pre-dinner essential on Saturday. The Guinness is exceptional." },
      { item: "The Long Hall, Dublin", detail: "Pint ~€6.50", tip: "One of Dublin's most beautiful Victorian pubs. Go post-dinner — it's best late when it's full." },
      { item: "Kehoe's, Dublin", detail: "Pint ~€6", tip: "Classic snug pub. Post-dinner on Saturday. One of the best atmospheres in the city." },
      { item: "Cobblestone, Dublin", detail: "Pint ~€5.50", tip: "Smithfield — spontaneous trad sessions. If you're near Stonybatter, add this to the circuit." },
      { item: "Taaffes, Galway", detail: "Pint ~€6", tip: "Trad music most nights. Good early stop on the Thursday Galway pub flow." },
      { item: "Tig Coili, Galway", detail: "Pint ~€6", tip: "No-frills trad pub on Mainguard Street. Lively, authentic, great craic." },
      { item: "Stag's Head, Dublin", detail: "Pint ~€6", tip: "Victorian gem off Dame Street. Post-Mister S option — beautiful bar, always buzzing." },
    ],
    activities: [
      { item: "Cliffs of Moher", detail: "€8/person, ~2.5hr drive from Galway", tip: "Worth it for those who go — leave Galway by 8am, back by 1pm. The rest of the group sleeps in and explores the city. Don't let it dictate the whole group's Friday morning." },
      { item: "Spanish Arch & Galway Cathedral", detail: "Free", tip: "Easy afternoon stroll after Friday lunch. The Cathedral is genuinely impressive — free to enter." },
      { item: "Shop Street & Eyre Square, Galway", detail: "Free", tip: "The heart of Galway. Walk it slowly, duck into any pub that looks good. Street musicians are often excellent." },
      { item: "Trinity College & Book of Kells, Dublin", detail: "€18/adult", tip: "If anyone wants culture on Sunday morning before the airport — book ahead online." },
    ],
    days: [
      { day: 1, date: "Thu", title: "Arrive → Sean's Bar → Galway", items: [
        { time: "8:30 AM", type: "transport", label: "Land Dublin Airport", note: "Pick up Sixt rental — Nissan Qashqai or similar. Drive on the left." },
        { time: "10:30 AM", type: "bar", label: "Sean's Bar, Athlone", note: "Oldest pub in Ireland. First pint of the trip. Non-negotiable stop on the drive west." },
        { time: "1:00 PM", type: "transport", label: "Drive Athlone → Galway (~1hr)", note: "Drop bags at The Residence Hotel." },
        { time: "2:00 PM", type: "bar", label: "Tigh Neachtain — lunch pints", note: "First Galway pub. Corner spot, great atmosphere. Sets the tone." },
        { time: "3:00 PM", type: "hotel", label: "Check in — The Residence Hotel", note: "Shower and regroup before the evening." },
        { time: "5:00 PM", type: "bar", label: "Pub flow: MP Walsh → Taaffes → Crane Bar", note: "All walkable. Build gradually. Crane Bar for the trad session — arrive early for a good spot." },
        { time: "6:30 PM", type: "restaurant", label: "Dinner — Universal Bar", note: "Outstanding food. First choice. Backups: Ard Bia, McDonagh's, Kirwan's Lane." },
        { time: "Late", type: "bar", label: "Late night: Munch Haven or Charcoal Grill", note: "Open till 3am. Essential if the night runs long." },
      ]},
      { day: 2, date: "Fri", title: "Galway Full Day", items: [
        { time: "8:00 AM", type: "activity", label: "Optional: Cliffs of Moher (split group)", note: "Leave by 8am, back by 1pm. ~€8pp entry. The rest: sleep in, coffee, slow morning." },
        { time: "1:00 PM", type: "restaurant", label: "Lunch — Ard Bia at Nimmos or Linnane's Lobster Bar", note: "Ard Bia for atmosphere, Linnane's if you want seafood on the water in New Quay." },
        { time: "3:00 PM", type: "activity", label: "Afternoon stroll — Spanish Arch, Cathedral, Shop Street", note: "Galway at its best in the afternoon. Eyre Square for a sit-down." },
        { time: "5:00 PM", type: "bar", label: "Pub flow: Blue Note → O'Connells → Garavans → Tig Coili", note: "Build gradually. Blue Note for early trad, Tig Coili to finish the Galway circuit." },
        { time: "7:45 PM", type: "restaurant", label: "Dinner — Ruibín", note: "7:30-7:45pm is the sweet spot. Backups: Kai Café, Bunch of Grapes, Dela." },
        { time: "Late", type: "bar", label: "Late option: Hughes Bar", note: "As energy allows. Then Munch Haven or Charcoal Grill for end-of-night food." },
      ]},
      { day: 3, date: "Sat", title: "Galway → Dublin", items: [
        { time: "9:00 AM", type: "restaurant", label: "Matt's Sandwiches before leaving Galway", note: "Best road food decision of the trip. Grab and go." },
        { time: "9:30 AM", type: "transport", label: "Drive Galway → Dublin (~2.5hrs)", note: "Arrive 11am-12pm. Return car — Uber everywhere in Dublin." },
        { time: "12:30 PM", type: "bar", label: "Gravediggers (John Kavanagh's)", note: "Uber out to Glasnevin. One of Dublin's truly great pubs. Worth every minute of the detour." },
        { time: "2:30 PM", type: "hotel", label: "Check in — Trinity City Hotel", note: "Uber back from Gravediggers. Drop bags, regroup." },
        { time: "4:00 PM", type: "bar", label: "Bowe's — best pint in Dublin", note: "Anchor the early Dublin evening here. Consistently outstanding Guinness." },
        { time: "5:30 PM", type: "restaurant", label: "Quick bite — Elephant & Castle (wings)", note: "Right after Bowe's. Or Las Tapas De Lola for tapas." },
        { time: "6:30 PM", type: "bar", label: "Pre-dinner: Mulligan's → Walsh's → Cobblestone", note: "Cobblestone optional if energy is high. Stonybatter area." },
        { time: "9:15 PM", type: "restaurant", label: "Dinner — Mister S", note: "Booked reservation. Outstanding. Do not be late." },
        { time: "11:00 PM", type: "bar", label: "Post-dinner: Long Hall → Kehoe's → Stag's Head", note: "Pick 1-2. All classics. Long Hall is the most beautiful Victorian pub interior in Dublin." },
        { time: "Late", type: "restaurant", label: "End of night: Zaytoon", note: "Parliament Street. The Dublin closer." },
      ]},
      { day: 4, date: "Sun", title: "Dublin → Departure", items: [
        { time: "Morning", type: "restaurant", label: "Coffee and light bite", note: "Easy morning. Repack, check out." },
        { time: "12:30 PM", type: "bar", label: "Gravediggers — opening pint", note: "Opens 12:30pm Sunday. Worth the Uber. The perfect last pint of the trip." },
        { time: "1:15 PM", type: "transport", label: "Leave for Dublin Airport", note: "Airport by 1:30pm. 4:00pm flight — allow 2.5hrs minimum." },
      ]},
    ]
  },
];

const REGIONS = ["All Regions","Asia","Europe","Central America","North America","South America","Africa","Oceania"];
const PRIMARY_TAGS  = ["All","family-friendly","romantic","adventure","food & wine","culture","beach","wildlife","scenic drives"];
const EXTENDED_TAGS = ["solo","girls trip","guys trip","road trip","city break","ski & snow","national parks","budget","luxury","off the beaten path","hiking & trekking","nightlife","history & heritage","wellness & spa","bachelor/bachelorette","group travel","long weekend","kid-free"];
const TAGS = [...PRIMARY_TAGS, ...EXTENDED_TAGS];

const REGION_GRADIENTS = {
  "Asia":           "linear-gradient(135deg, #C84B31 0%, #ECAB51 100%)",
  "Europe":         "linear-gradient(135deg, #2C3E7A 0%, #5B7FBF 100%)",
  "North America":  "linear-gradient(135deg, #1A6B3C 0%, #4CAF7D 100%)",
  "Central America":"linear-gradient(135deg, #7B3FA0 0%, #C47DD4 100%)",
  "South America":  "linear-gradient(135deg, #B5451B 0%, #E8903A 100%)",
  "Africa":         "linear-gradient(135deg, #8B6914 0%, #D4A843 100%)",
  "Oceania":        "linear-gradient(135deg, #0E6B8C 0%, #2EBFDB 100%)",
};
const REGION_EMOJI = {
  "Asia":"🏯", "Europe":"🏰", "North America":"🗽",
  "Central America":"🌴", "South America":"🌿",
  "Africa":"🦁", "Oceania":"🐚",
};
const DURATION_FILTERS = ["Any Length", "Weekend (1-3 days)", "1 Week (4-7 days)", "2 Weeks (8-14 days)", "2+ Weeks (15+ days)"];
const ADMIN_PASSWORDS = ["Guinness"];
// ── AI Prompt Generator ───────────────────────────────────────────────────────
const AI_SUBMISSION_PROMPT = `You are helping me document a trip I took so I can share it on TripCopycat.

Please ask me questions about my trip and help me fill in the following details. Ask conversationally, one section at a time. When done, output a clean structured summary under these exact headings:

TRIP OVERVIEW
- Title:
- Destination:
- Region: (Asia / Europe / North America / Central America / South America / Africa / Oceania)
- Date: (Month Year)
- Duration:
- Who traveled:
- Tags: (choose from: family-friendly, romantic, adventure, food & wine, culture, beach, wildlife, scenic drives)

WHAT I LOVED:
(3-5 sentences about highlights)

WHAT I WOULD DO DIFFERENTLY:
(2-3 sentences of honest advice)

FLIGHTS:
- Airline and route:
- Approximate cost per person:
- Tip:

HOTELS:
For each place:
- Name:
- Nights and cost:
- Tip:

RESTAURANTS:
For each notable meal:
- Name and location:
- Cost:
- Tip:

BARS:
- Name:
- Cost:
- Tip:

ACTIVITIES:
- Name:
- Cost:
- Tip:

DAILY ITINERARY:
Day N - Title - Date
  Time - type - what you did - note

Start by asking: Where did you go and when?`;


const catConfig = {
  airfare:     { label: "✈️ Airfare",      color: C.azureDeep  },
  hotels:      { label: "🏨 Hotels",       color: C.cerulean   },
  restaurants: { label: "🍽️ Restaurants", color: C.red        },
  bars:        { label: "🍸 Bars",         color: C.amber      },
  activities:  { label: "🎯 Activities",   color: C.green      },
};

const typeStyles = {
  hotel:      { bg: C.seafoamDeep, color: C.cerulean,  icon: "🏨" },
  restaurant: { bg: C.redBg,       color: C.red,        icon: "🍽️" },
  bar:        { bg: C.amberBg,     color: C.amber,      icon: "🍸" },
  activity:   { bg: C.greenBg,     color: C.green,      icon: "🎯" },
  transport:  { bg: "#E8F0FA",     color: C.azureDeep,  icon: "🚗" },
};

const MOCK_PHOTOS = [
  { id:"p1",  filename:"IMG_0421.jpg", date:"Mar 12, 2:14 PM", location:"Shinjuku, Tokyo",  detectedPlace:"Shinjuku Granbell Hotel",           category:"hotel",      confidence:0.94, accepted:null },
  { id:"p2",  filename:"IMG_0435.jpg", date:"Mar 12, 6:32 PM", location:"Shibuya, Tokyo",   detectedPlace:"Ichiran Ramen Shibuya",              category:"restaurant", confidence:0.91, accepted:null },
  { id:"p3",  filename:"IMG_0502.jpg", date:"Mar 13,10:08 AM", location:"Harajuku, Tokyo",  detectedPlace:"Meiji Shrine",                      category:"activity",   confidence:0.97, accepted:null },
  { id:"p4",  filename:"IMG_0561.jpg", date:"Mar 13, 5:44 PM", location:"Shibuya, Tokyo",   detectedPlace:"Shibuya Crossing",                  category:"activity",   confidence:0.99, accepted:null },
  { id:"p5",  filename:"IMG_0633.jpg", date:"Mar 14, 7:12 AM", location:"Asakusa, Tokyo",   detectedPlace:"Senso-ji Temple",                   category:"activity",   confidence:0.98, accepted:null },
  { id:"p6",  filename:"IMG_0701.jpg", date:"Mar 14, 1:22 PM", location:"Asakusa, Tokyo",   detectedPlace:"Tokyo Skytree",                     category:"activity",   confidence:0.95, accepted:null },
  { id:"p7",  filename:"IMG_0744.jpg", date:"Mar 15, 9:03 AM", location:"Odaiba, Tokyo",    detectedPlace:"teamLab Borderless",                category:"activity",   confidence:0.96, accepted:null },
  { id:"p8",  filename:"IMG_0812.jpg", date:"Mar 15, 6:18 PM", location:"Toyosu, Tokyo",    detectedPlace:"Sushi Dai Toyosu Market",           category:"restaurant", confidence:0.88, accepted:null },
  { id:"p9",  filename:"IMG_0899.jpg", date:"Mar 16, 2:55 PM", location:"Ginza, Tokyo",     detectedPlace:"The Celestine Ginza",               category:"hotel",      confidence:0.87, accepted:null },
  { id:"p10", filename:"IMG_0921.jpg", date:"Mar 16, 5:38 PM", location:"Shibuya, Tokyo",   detectedPlace:"Shibuya Sky Observation Deck",      category:"activity",   confidence:0.99, accepted:null },
  { id:"p11", filename:"IMG_0934.jpg", date:"Mar 17,11:20 AM", location:"Shinjuku, Tokyo",  detectedPlace:"Unknown restaurant (menu detected)",category:"restaurant", confidence:0.61, accepted:null },
  { id:"p12", filename:"IMG_0977.jpg", date:"Mar 17, 3:15 PM", location:"Harajuku, Tokyo",  detectedPlace:"Takeshita Street",                  category:"activity",   confidence:0.92, accepted:null },
];

const MOCK_EMAILS = [
  { id:"e1", source:"United Airlines", subject:"Booking confirmation – JFK→NRT",           extracted:"United Airlines JFK → NRT · Mar 12 · Business class",        category:"airfare",   date:"Mar 12",    accepted:null },
  { id:"e2", source:"Booking.com",     subject:"Reservation confirmed: Shinjuku Granbell", extracted:"Shinjuku Granbell Hotel · Mar 12–16 · $220/night",            category:"hotel",     date:"Mar 12–16", accepted:null },
  { id:"e3", source:"Booking.com",     subject:"Reservation confirmed: The Celestine Ginza",extracted:"The Celestine Ginza · Mar 16–19 · $310/night",               category:"hotel",     date:"Mar 16–19", accepted:null },
  { id:"e4", source:"teamLab",         subject:"Your teamLab Borderless tickets",           extracted:"teamLab Borderless · Mar 15 · 9:00 AM · 2 adults, 2 children",category:"activity",  date:"Mar 15",    accepted:null },
  { id:"e5", source:"Viator",          subject:"Booking confirmed: Ghibli Museum entry",    extracted:"Ghibli Museum · Mar 18 · $15/person · 4 tickets",             category:"activity",  date:"Mar 18",    accepted:null },
  { id:"e6", source:"OpenTable",       subject:"Reservation at Sushi Dai confirmed",         extracted:"Sushi Dai Toyosu · Mar 15 · 6:00 PM · Party of 4",           category:"restaurant",date:"Mar 15",    accepted:null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPlainText(trip) {
  if (!trip) return "";
  const L = [];
  L.push(`TRIPCOPYCAT — ${trip.title.toUpperCase()}`);
  L.push(`${trip.destination}  ·  ${trip.duration}  ·  ${trip.date}`);
  L.push(`Travelers: ${trip.travelers}`);
  if (trip.days?.length) {
    L.push(""); L.push("DAILY ITINERARY");
    L.push("────────────────────────────────────────");
    trip.days.forEach(d => {
      L.push(""); L.push(`Day ${d.day} — ${d.title}  (${d.date})`);
      d.items.forEach(it => L.push(`  ${it.time.padEnd(8)}·  ${it.label}${it.note ? `  —  ${it.note}` : ""}`));
    });
  }
  L.push(""); L.push("TRIP DETAILS");
  L.push("────────────────────────────────────────");
  Object.entries(catConfig).forEach(([key, cfg]) => {
    if (!trip[key]?.length) return;
    L.push(""); L.push(cfg.label);
    trip[key].forEach(it => L.push(`  •  ${it.item}  |  ${it.detail}  |  Tip: ${it.tip}`));
  });
  L.push(""); L.push("FEEDBACK");
  L.push("────────────────────────────────────────");
  L.push(`Loved:       ${trip.loves}`);
  L.push(`Next time:   ${trip.doNext}`);
  return L.join("\n");
}

function Pill({ category }) {
  const map = { hotel:C.cerulean, restaurant:C.red, activity:C.green, bar:C.amber, airfare:C.azureDeep, transport:C.azureDeep };
  const col = map[category] || C.slateLight;
  return <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", padding:"2px 9px", borderRadius:"20px", background:col+"22", color:col }}>{category}</span>;
}

function ConfBar({ val }) {
  const pct = Math.round(val * 100);
  const col = pct >= 90 ? C.green : pct >= 70 ? C.amber : C.red;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
      <div style={{ flex:1, height:"4px", background:C.tide, borderRadius:"2px" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:"2px" }} />
      </div>
      <span style={{ fontSize:"10px", fontWeight:700, color:col, width:"30px" }}>{pct}%</span>
    </div>
  );
}

// ── Photo Import ──────────────────────────────────────────────────────────────

// Extract EXIF GPS and timestamp from image file (client-side, no upload needed)
async function extractExif(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const buf = e.target.result;
      const view = new DataView(buf);
      try {
        if (view.getUint16(0) !== 0xFFD8) return resolve({});
        let offset = 2;
        while (offset < view.byteLength - 2) {
          const marker = view.getUint16(offset);
          if (marker === 0xFFE1) {
            const len = view.getUint16(offset + 2);
            const exifStr = String.fromCharCode(...new Uint8Array(buf, offset + 4, 6));
            if (exifStr.startsWith("Exif")) {
              const tiffOffset = offset + 10;
              const little = view.getUint16(tiffOffset) === 0x4949;
              const rd = (o, s) => s === 2 ? view.getUint16(tiffOffset + o, little) : view.getUint32(tiffOffset + o, little);
              const ifdOffset = rd(4, 4);
              const entries = rd(ifdOffset, 2);
              let gpsOff = null, dateStr = null;
              for (let i = 0; i < entries; i++) {
                const eOff = tiffOffset + ifdOffset + 2 + i * 12;
                const tag = view.getUint16(eOff, little);
                if (tag === 0x8825) gpsOff = tiffOffset + view.getUint32(eOff + 8, little);
                if (tag === 0x9003) {
                  const cnt = view.getUint32(eOff + 4, little);
                  const valOff = cnt <= 4 ? eOff + 8 : tiffOffset + view.getUint32(eOff + 8, little);
                  dateStr = String.fromCharCode(...new Uint8Array(buf, valOff, cnt - 1));
                }
              }
              let lat = null, lon = null;
              if (gpsOff) {
                try {
                  const gpsEntries = rd(gpsOff - tiffOffset, 2);
                  let latVal, lonVal, latRef, lonRef;
                  for (let i = 0; i < gpsEntries; i++) {
                    const ge = gpsOff + 2 + i * 12;
                    const gtag = view.getUint16(ge, little);
                    const gtype = view.getUint16(ge + 2, little);
                    const gcnt = view.getUint32(ge + 4, little);
                    const gvoff = tiffOffset + view.getUint32(ge + 8, little);
                    const readRat = off => view.getUint32(off, little) / (view.getUint32(off + 4, little) || 1);
                    if (gtag === 1) latRef = String.fromCharCode(view.getUint8(ge + 8));
                    if (gtag === 2) latVal = readRat(gvoff) + readRat(gvoff+8)/60 + readRat(gvoff+16)/3600;
                    if (gtag === 3) lonRef = String.fromCharCode(view.getUint8(ge + 8));
                    if (gtag === 4) lonVal = readRat(gvoff) + readRat(gvoff+8)/60 + readRat(gvoff+16)/3600;
                  }
                  if (latVal != null && lonVal != null) {
                    lat = latRef === "S" ? -latVal : latVal;
                    lon = lonRef === "W" ? -lonVal : lonVal;
                  }
                } catch(e) {}
              }
              return resolve({ lat, lon, dateStr, filename: file.name });
            }
          }
          if (marker === 0xFFDA) break;
          offset += 2 + view.getUint16(offset + 2);
        }
      } catch(e) {}
      resolve({ filename: file.name });
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

// Compress image via Canvas to ~200KB max
async function compressImage(file, maxW = 1200, quality = 0.65) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(blob);
        URL.revokeObjectURL(url);
      }, "image/jpeg", quality);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Reverse geocode lat/lon to place name using OpenStreetMap (free, no key needed)
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "Accept-Language": "en" }
    });
    const data = await res.json();
    const a = data.address || {};
    return [a.tourism || a.amenity || a.leisure || a.building, a.city || a.town || a.village, a.country]
      .filter(Boolean).join(", ");
  } catch { return null; }
}

function PhotoImportModal({ onClose, onComplete, skipCloseOnComplete }) {
  const [phase, setPhase] = useState("drop");
  const [photos, setPhotos] = useState([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rawDebug, setRawDebug] = useState("");
  const fileRef = useRef();

  const processPhotos = async (files) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files).slice(0, 30);
    setPhase("processing");
    setProgress(0);

    // Step 1: Extract EXIF from all photos
    setProgressLabel("Reading GPS & timestamps…");
    const metaArr = [];
    for (let i = 0; i < fileArr.length; i++) {
      const meta = await extractExif(fileArr[i]);
      // Reverse geocode if GPS available
      if (meta.lat && meta.lon) {
        meta.placeName = await reverseGeocode(meta.lat, meta.lon);
      }
      metaArr.push(meta);
      setProgress(Math.round((i + 1) / fileArr.length * 30));
    }

    // Step 2: Compress all photos
    setProgressLabel("Compressing photos…");
    const compressed = [];
    for (let i = 0; i < fileArr.length; i++) {
      const b64 = await compressImage(fileArr[i]);
      if (b64) compressed.push({ b64, meta: metaArr[i], idx: i });
      setProgress(30 + Math.round((i + 1) / fileArr.length * 40));
    }

    // Step 3: Send to Claude API
    setProgressLabel("Analysing with AI…");
    setProgress(70);

    const metaSummary = compressed.map((p, i) => {
      const m = p.meta;
      const parts = [`Photo ${i + 1}: ${m.filename || "photo"}`];
      if (m.placeName) parts.push(`GPS location: ${m.placeName}`);
      else if (m.lat && m.lon) parts.push(`GPS: ${m.lat.toFixed(4)}, ${m.lon.toFixed(4)}`);
      if (m.dateStr) parts.push(`Taken: ${m.dateStr}`);
      return parts.join(" | ");
    }).join("\n");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("No API key configured");

      const parts = [
        {
          text: `You are analysing travel photos to reconstruct a trip itinerary. Here is the GPS and timestamp metadata extracted from each photo:\n\n${metaSummary}\n\nIMPORTANT: Use the GPS location data to identify SPECIFIC venue names. If GPS shows a photo was taken at a specific street address or named place, use that exact place name. Do not use generic descriptions like "local restaurant" or "hotel balcony" — always try to name the specific venue based on GPS coordinates, visible signage, or recognisable landmarks.\n\nReturn ONLY a JSON object with this exact structure, no other text:\n{\n  "destination": "City, Country",\n  "region": "Europe|Asia|North America|Central America|South America|Africa|Oceania",\n  "duration": "N days",\n  "travelers": "description e.g. Couple, Family, Guys trip",\n  "tags": ["tag1", "tag2"],\n  "loves": "2-4 sentences about specific highlights visible in the photos — name actual places",\n  "doNext": "1-2 sentences of honest advice",\n  "hotels": [{"item": "hotel name from GPS or signage", "detail": "location", "tip": ""}],\n  "restaurants": [{"item": "restaurant name from GPS or signage", "detail": "cuisine type", "tip": ""}],\n  "bars": [{"item": "bar name from GPS or signage", "detail": "type", "tip": ""}],\n  "activities": [{"item": "specific activity or landmark name", "detail": "description", "tip": ""}],\n  "days": [{"day": 1, "date": "", "title": "Day title", "items": [{"time": "", "type": "activity|restaurant|bar|hotel|transport", "label": "specific venue or activity name", "note": ""}]}]\n}`
        },
        ...compressed.map(p => ({
          inline_data: { mime_type: "image/jpeg", data: p.b64 }
        }))
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] })
        }
      );
      const data = await res.json();
      const rawText = JSON.stringify(data).slice(0, 800);
      setRawDebug(rawText);
      console.log("Gemini response:", rawText);
      setProgress(95);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Gemini text:", text.slice(0, 300));
      const jsonMatch = text.replace(/```json\n?|```\n?/g, "").match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
      setPhase("review");
      setProgress(100);
    } catch(e) {
      console.error("Claude API error:", e);
      setError(`Analysis failed: ${e.message}. Please try again.`);
      setPhase("error");
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.7)", zIndex:3000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"680px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.22)`, border:`1px solid ${C.tide}` }}>

        {/* header */}
        <div style={{ padding:"22px 30px", borderBottom:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.seafoam }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"22px" }}>📸</span>
            <div>
              <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Photo Album Import</div>
              <div style={{ fontSize:"11px", color:C.slateLight }}>Upload up to 30 photos · GPS + AI reconstructs your trip automatically</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>

        {/* drop zone */}
        {phase === "drop" && (
          <div style={{ padding:"44px 32px", textAlign:"center", background:C.white }}>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:"none" }} onChange={e => processPhotos(e.target.files)} />
            <div onDrop={e => { e.preventDefault(); processPhotos(e.dataTransfer.files); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              style={{ border:`2px dashed ${C.tide}`, borderRadius:"16px", padding:"48px 32px", cursor:"pointer", background:C.seafoam, transition:"border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.amber}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.tide}>
              <div style={{ fontSize:"44px", marginBottom:"14px" }}>📁</div>
              <div style={{ fontSize:"17px", fontWeight:700, color:C.slate, marginBottom:"6px" }}>Drop your trip photos here</div>
              <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"20px" }}>Or click to browse · Up to 30 photos · JPEG, PNG, HEIC</div>
              <div style={{ display:"flex", justifyContent:"center", gap:"8px", flexWrap:"wrap" }}>
                {["📍 GPS → place names", "🕐 Timestamps → timeline", "👁️ AI identifies venues", "🗜️ Auto-compressed"].map(t => (
                  <span key={t} style={{ fontSize:"11px", background:C.white, color:C.slateMid, padding:"4px 12px", borderRadius:"20px", border:`1px solid ${C.tide}` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* processing */}
        {phase === "processing" && (
          <div style={{ padding:"64px 32px", textAlign:"center", background:C.white }}>
            <div style={{ fontSize:"44px", marginBottom:"20px" }}>
              {progress < 30 ? "📍" : progress < 70 ? "🗜️" : "🤖"}
            </div>
            <div style={{ fontSize:"17px", fontWeight:700, color:C.slate, marginBottom:"6px" }}>{progressLabel}</div>
            <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"28px" }}>This takes about 15–20 seconds for 30 photos</div>
            <div style={{ maxWidth:"380px", margin:"0 auto" }}>
              <div style={{ height:"8px", background:C.seafoamDeep, borderRadius:"4px", overflow:"hidden" }}>
                <div style={{ height:"100%", background:`linear-gradient(90deg,${C.azure},${C.amber})`, borderRadius:"4px", transition:"width .3s", width:`${progress}%` }} />
              </div>
              <div style={{ marginTop:"10px", fontSize:"12px", color:C.muted }}>{progress}%</div>
            </div>
            <div style={{ marginTop:"24px", display:"flex", justifyContent:"center", gap:"7px", flexWrap:"wrap" }}>
              {[["📍 GPS", 0], ["🗜️ Compress", 30], ["🤖 AI Analysis", 70], ["✓ Done", 95]].map(([label, threshold]) => (
                <span key={label} style={{ fontSize:"11px", padding:"4px 11px", borderRadius:"20px", background:progress >= threshold ? C.seafoamDeep : C.sand, color:progress >= threshold ? C.azureDeep : C.muted, transition:"all .4s" }}>{label}</span>
              ))}
            </div>
          </div>
        )}

        {/* review result */}
        {phase === "review" && result && (
          <div style={{ padding:"24px 28px", maxHeight:"60vh", overflowY:"auto" }}>
            <div style={{ background:C.greenBg, border:`1px solid ${C.green}`, borderRadius:"12px", padding:"14px 18px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ fontSize:"20px" }}>✅</span>
              <div>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.slate }}>Trip reconstructed from your photos</div>
                <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"2px" }}>Review the details below, then import to your form</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
              {[["📍 Destination", result.destination], ["🌍 Region", result.region], ["⏱️ Duration", result.duration], ["👥 Travelers", result.travelers]].map(([label, val]) => val && (
                <div key={label} style={{ background:C.seafoam, borderRadius:"8px", padding:"10px 12px", border:`1px solid ${C.tide}` }}>
                  <div style={{ fontSize:"10px", color:C.muted, marginBottom:"2px" }}>{label}</div>
                  <div style={{ fontSize:"12px", fontWeight:600, color:C.slate }}>{val}</div>
                </div>
              ))}
            </div>

            {result.loves && (
              <div style={{ marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", fontWeight:700, color:C.green, marginBottom:"4px" }}>❤️ WHAT THEY LOVED</div>
                <div style={{ fontSize:"12px", color:C.slateMid, lineHeight:1.65 }}>{result.loves}</div>
              </div>
            )}

            {["bars", "restaurants", "activities", "hotels"].map(cat => result[cat]?.length > 0 && (
              <div key={cat} style={{ marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>
                  {cat === "bars" ? "🍸 Bars" : cat === "restaurants" ? "🍽️ Restaurants" : cat === "activities" ? "🎯 Activities" : "🏨 Hotels"}
                </div>
                {result[cat].map((item, i) => (
                  <div key={i} style={{ fontSize:"12px", color:C.slate, padding:"5px 0", borderBottom:`1px solid ${C.seafoamDeep}` }}>
                    <strong>{item.item}</strong>{item.detail ? ` — ${item.detail}` : ""}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
              <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => { onComplete && onComplete(result); if (!skipCloseOnComplete) onClose(); }} style={{ flex:2, padding:"10px", borderRadius:"8px", border:"none", background:C.cta, color:C.ctaText, fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                Import to Trip Form →
              </button>
            </div>
          </div>
        )}

        {/* error */}
        {phase === "error" && (
          <div style={{ padding:"32px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"36px", marginBottom:"12px" }}>😕</div>
            <div style={{ fontSize:"16px", fontWeight:700, color:C.slate, marginBottom:"8px" }}>Something went wrong</div>
            <div style={{ fontSize:"13px", color:C.slateLight, marginBottom:"16px" }}>{error}</div>
            {rawDebug && (
              <div style={{ background:C.seafoam, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"10px 12px", marginBottom:"16px", textAlign:"left", maxHeight:"120px", overflowY:"auto" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, marginBottom:"4px" }}>DEBUG — API Response:</div>
                <div style={{ fontSize:"10px", color:C.slateMid, wordBreak:"break-all", lineHeight:1.5 }}>{rawDebug}</div>
              </div>
            )}
            <button onClick={() => setPhase("drop")} style={{ padding:"10px 24px", borderRadius:"8px", border:"none", background:C.cta, color:C.ctaText, fontWeight:700, cursor:"pointer" }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Email Import ──────────────────────────────────────────────────────────────

function EmailImportModal({ onClose }) {
  const [phase, setPhase] = useState("connect");
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]);

  const startScan = () => {
    setPhase("scanning"); setProgress(0);
    const t = setInterval(() => setProgress(p => {
      if (p >= 100) { clearInterval(t); setPhase("review"); setItems(MOCK_EMAILS.map(x => ({ ...x, accepted:null }))); return 100; }
      return p + 3;
    }), 48);
  };

  const toggle   = (id, v) => setItems(is => is.map(i => i.id === id ? { ...i, accepted:v } : i));
  const acceptAll = () => setItems(is => is.map(i => ({ ...i, accepted:true })));
  const nAcc = items.filter(i => i.accepted === true).length;
  const catIcon  = { airfare:"✈️", hotel:"🏨", activity:"🎯", restaurant:"🍽️" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.7)", zIndex:3000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"740px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.22)`, border:`1px solid ${C.tide}` }}>

        <div style={{ padding:"22px 30px", borderBottom:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.seafoam }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"22px" }}>📧</span>
            <div>
              <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Email & Booking Import</div>
              <div style={{ fontSize:"11px", color:C.slateLight }}>Parses flight, hotel, restaurant & tour confirmations automatically</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>

        {phase === "connect" && (
          <div style={{ padding:"32px 28px", background:C.white }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"24px" }}>
              {[
                { icon:"📬", title:"Connect Gmail", desc:"Read-only OAuth. We scan for: confirmation, booking, reservation, itinerary.", input:true, btnLabel:"Connect & Scan" },
                { icon:"📮", title:"Forward Emails", desc:"No login needed. Forward booking confirmations to your personal import address.", addr:true, btnLabel:"Demo: Parse sample emails" },
              ].map((opt,i) => (
                <div key={i} style={{ background:C.seafoam, borderRadius:"14px", padding:"22px", border:`1px solid ${C.tide}` }}>
                  <div style={{ fontSize:"26px", marginBottom:"10px" }}>{opt.icon}</div>
                  <div style={{ fontSize:"14px", fontWeight:700, color:C.slate, marginBottom:"5px" }}>{opt.title}</div>
                  <div style={{ fontSize:"11px", color:C.slateLight, marginBottom:"14px", lineHeight:1.6 }}>{opt.desc}</div>
                  {opt.input && <input placeholder="your@gmail.com" style={{ width:"100%", padding:"8px 11px", borderRadius:"7px", border:`1px solid ${C.tide}`, background:C.white, color:C.slate, fontSize:"12px", outline:"none", boxSizing:"border-box", marginBottom:"9px" }} />}
                  {opt.addr && <div style={{ background:C.white, border:`1px solid ${C.tide}`, borderRadius:"7px", padding:"9px 11px", fontSize:"11px", color:C.azureDeep, fontFamily:"monospace", marginBottom:"9px", userSelect:"all" }}>import@parse.tripcopycat.com</div>}
                  <button onClick={startScan} style={{ width:"100%", padding:"9px", borderRadius:"8px", border:`1px solid ${C.azure}`, background:i===0?C.azure:C.white, color:i===0?C.white:C.azure, fontWeight:700, cursor:"pointer", fontSize:"12px" }}>{opt.btnLabel}</button>
                </div>
              ))}
            </div>
            <div style={{ background:C.seafoam, borderRadius:"10px", padding:"12px 16px", border:`1px solid ${C.tide}` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"7px" }}>Recognized sources</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {["United Airlines","Delta","American","Booking.com","Marriott","Hilton","Airbnb","OpenTable","Resy","Viator","GetYourGuide","Amtrak","Eurostar"].map(s => (
                  <span key={s} style={{ fontSize:"11px", background:C.white, color:C.slateMid, padding:"2px 9px", borderRadius:"12px", border:`1px solid ${C.tide}` }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div style={{ padding:"64px 32px", textAlign:"center", background:C.white }}>
            <div style={{ fontSize:"44px", marginBottom:"18px" }}>📧</div>
            <div style={{ fontSize:"17px", fontWeight:700, color:C.slate, marginBottom:"6px" }}>Scanning inbox…</div>
            <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"24px" }}>Parsing travel confirmation emails</div>
            <div style={{ maxWidth:"340px", margin:"0 auto" }}>
              <div style={{ height:"5px", background:C.seafoamDeep, borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ height:"100%", background:`linear-gradient(90deg,${C.azure},${C.green})`, borderRadius:"3px", transition:"width .1s", width:`${progress}%` }} />
              </div>
              <div style={{ marginTop:"9px", fontSize:"12px", color:C.muted }}>Found {Math.floor(progress/17)} confirmations…</div>
            </div>
          </div>
        )}

        {phase === "review" && (
          <div>
            <div style={{ padding:"12px 28px", background:C.seafoam, borderBottom:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:"12px", color:C.slateLight }}><strong style={{ color:C.slate }}>{items.length}</strong> confirmations detected · <strong style={{ color:C.green }}>{nAcc}</strong> accepted</div>
              <button onClick={acceptAll} style={{ padding:"5px 14px", borderRadius:"7px", border:"none", background:C.green, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Accept All</button>
            </div>
            <div style={{ padding:"14px 22px", maxHeight:"400px", overflowY:"auto", background:C.white }}>
              {items.map(item => (
                <div key={item.id} style={{ background:C.white, borderRadius:"11px", padding:"14px 16px", marginBottom:"9px", border:`1px solid ${item.accepted===true?C.green:item.accepted===false?C.red:C.tide}`, display:"flex", gap:"12px", alignItems:"center", boxShadow:`0 1px 4px rgba(44,62,80,0.06)` }}>
                  <div style={{ fontSize:"22px", flexShrink:0 }}>{catIcon[item.category]||"📄"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"10px", color:C.muted, marginBottom:"2px" }}>{item.source} · {item.subject}</div>
                    <div style={{ fontSize:"13px", fontWeight:700, color:C.slate, marginBottom:"4px" }}>{item.extracted}</div>
                    <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
                      <Pill category={item.category} />
                      <span style={{ fontSize:"10px", color:C.muted }}>{item.date}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"5px", flexShrink:0 }}>
                    <button onClick={() => toggle(item.id,true)} style={{ padding:"6px 12px", borderRadius:"7px", border:"none", cursor:"pointer", background:item.accepted===true?C.green:C.greenBg, color:item.accepted===true?C.white:C.green, fontWeight:700, fontSize:"12px" }}>✓</button>
                    <button onClick={() => toggle(item.id,false)} style={{ padding:"6px 12px", borderRadius:"7px", border:"none", cursor:"pointer", background:item.accepted===false?C.red:C.redBg, color:item.accepted===false?C.white:C.red, fontWeight:700, fontSize:"12px" }}>✗</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"14px 28px", borderTop:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", background:C.seafoam }}>
              <button onClick={onClose} style={{ padding:"9px 18px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={onClose} style={{ padding:"9px 22px", borderRadius:"8px", border:"none", background:`linear-gradient(135deg,${C.azure},${C.azureDark})`, color:C.white, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Add {nAcc} items to Trip →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Smart Import Hub ──────────────────────────────────────────────────────────

function SmartImportHub({ onClose, onPhotoComplete }) {
  const [active, setActive] = useState(null);
  if (active === "photo") return <PhotoImportModal onClose={() => setActive(null)} onComplete={(data) => { onPhotoComplete && onPhotoComplete(data); onClose(); }} />;
  if (active === "email") return <EmailImportModal onClose={() => setActive(null)} />;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.65)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"540px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.2)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"26px 30px", borderBottom:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start", background:C.seafoam }}>
          <div>
            <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Smart Import</div>
            <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"3px" }}>Auto-build your itinerary from existing data</div>
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>
        <div style={{ padding:"22px 26px", display:"flex", flexDirection:"column", gap:"12px", background:C.white }}>
          {[
            { id:"photo", icon:"📸", title:"Photo Album Import", desc:"AI reads GPS, timestamps & image content to rebuild your journey", badge:"Most Magical", bc:C.azure,
              bullets:["Upload photos → EXIF GPS → auto place names","Timestamps → day-by-day timeline","AI reads menus, signs, venue interiors","~80% auto-fill accuracy"] },
            { id:"email", icon:"📧", title:"Email & Bookings Import", desc:"Parse flight, hotel, restaurant & activity confirmations automatically", badge:"Most Accurate", bc:C.green,
              bullets:["Connect Gmail (read-only) or forward emails","Reads: airline, hotel, reservation dates, cost","~95% accuracy on structured bookings","Works with 40+ booking platforms"] },
          ].map(opt => (
            <button key={opt.id} onClick={() => setActive(opt.id)} style={{ textAlign:"left", padding:"18px 20px", borderRadius:"14px", border:`1px solid ${C.tide}`, background:C.seafoam, cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.azure; e.currentTarget.style.background=C.seafoamDeep; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.tide; e.currentTarget.style.background=C.seafoam; }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"9px" }}>
                <span style={{ fontSize:"26px" }}>{opt.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:"14px", color:C.slate }}>{opt.title}</div>
                  <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"2px" }}>{opt.desc}</div>
                </div>
                <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 9px", borderRadius:"20px", background:opt.bc+"22", color:opt.bc, flexShrink:0 }}>{opt.badge}</span>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {opt.bullets.map(b => <span key={b} style={{ fontSize:"10px", color:C.slateMid, background:C.white, padding:"2px 9px", borderRadius:"12px", border:`1px solid ${C.tide}` }}>{b}</span>)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function matchesDuration(trip, filter) {
  if (filter === "Any Length") return true;
  const n = parseInt(trip.duration) || 0;
  if (filter === "Weekend (1-3 days)") return n >= 1 && n <= 3;
  if (filter === "1 Week (4-7 days)") return n >= 4 && n <= 7;
  if (filter === "2 Weeks (8-14 days)") return n >= 8 && n <= 14;
  if (filter === "2+ Weeks (15+ days)") return n >= 15;
  return true;
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tc_bookmarks") || "[]"); } catch { return []; }
  });
  const toggle = (id) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem("tc_bookmarks", JSON.stringify(next));
      return next;
    });
  };
  return { bookmarks, toggle };
}

// ── Export Modal ──────────────────────────────────────────────────────────────

function ExportModal({ trip, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = buildPlainText(trip);
  const copy = () => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); });

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.7)", zIndex:3000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"36px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"660px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.22)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"22px 26px", borderBottom:`1px solid ${C.tide}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.seafoam }}>
          <div>
            <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Export Itinerary</div>
            <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"2px" }}>Plain text · paste into Notes, iMessage, email, WhatsApp</div>
          </div>
          <div style={{ display:"flex", gap:"7px" }}>
            <button onClick={copy} style={{ padding:"8px 18px", borderRadius:"8px", border:"none", background:copied?C.green:C.azure, color:C.white, fontWeight:700, fontSize:"12px", cursor:"pointer", transition:"background .2s" }}>
              {copied ? "✓ Copied!" : "📋 Copy All"}
            </button>
            <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
          </div>
        </div>
        <pre style={{ margin:0, padding:"22px 26px", fontSize:"11.5px", lineHeight:1.95, color:C.slateMid, fontFamily:"'Fira Code','Courier New',monospace", maxHeight:"540px", overflowY:"auto", whiteSpace:"pre-wrap", wordBreak:"break-word", background:C.seafoam }}>
          {text}
        </pre>
        <div style={{ padding:"10px 26px", borderTop:`1px solid ${C.tide}`, background:C.white }}>
          <span style={{ fontSize:"11px", color:C.muted }}>Format: Day N — Activity — Location — Note</span>
        </div>
      </div>
    </div>
  );
}

// ── Daily Itinerary ───────────────────────────────────────────────────────────

function DailyItinerary({ days }) {
  const [active, setActive] = useState(0);
  const d = days[active];
  return (
    <div>
      <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"22px" }}>
        {days.map((day, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding:"9px 15px", borderRadius:"10px", border:`1px solid ${active===i?C.slate:C.tide}`, cursor:"pointer", flexShrink:0, textAlign:"left", background:active===i?C.slate:C.white, color:active===i?C.white:C.slateLight, boxShadow:active===i?`0 4px 12px rgba(28,43,58,0.22)`:"none", transition:"all .15s" }}>
            <div style={{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", opacity:.75 }}>Day {day.day}</div>
            <div style={{ fontSize:"12px", fontWeight:700, marginTop:"2px" }}>{day.date}</div>
            <div style={{ fontSize:"10px", marginTop:"2px", opacity:.85 }}>{day.title}</div>
          </button>
        ))}
      </div>
      <div style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:C.muted, marginBottom:"3px" }}>Day {d.day} · {d.date}</div>
        <div style={{ fontSize:"21px", fontWeight:700, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>{d.title}</div>
      </div>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:"68px", top:0, bottom:0, width:"1px", background:C.tide }} />
        {d.items.map((item, i) => {
          const ts = typeStyles[item.type] || typeStyles.activity;
          return (
            <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
              <div style={{ width:"56px", flexShrink:0, textAlign:"right", paddingTop:"8px" }}>
                <span style={{ fontSize:"10px", fontWeight:700, color:C.muted }}>{item.time}</span>
              </div>
              <div style={{ width:"26px", flexShrink:0, display:"flex", alignItems:"flex-start", paddingTop:"6px", justifyContent:"center", zIndex:1 }}>
                <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:ts.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", boxShadow:`0 0 0 3px ${C.white}` }}>{ts.icon}</div>
              </div>
              <div style={{ flex:1, background:C.white, border:`1px solid ${C.tide}`, borderRadius:"10px", padding:"10px 14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
                <span style={{ fontSize:"9px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:ts.color, background:ts.bg, padding:"2px 7px", borderRadius:"20px" }}>{item.type}</span>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.slate, marginTop:"4px" }}>{item.label}</div>
                {item.note && <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"3px", lineHeight:1.5, fontStyle:"italic" }}>{item.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Trip Modal ────────────────────────────────────────────────────────────────

function TripModal({ trip, onClose, allTrips, isBookmarked, onBookmark }) {
  const [view, setView] = useState("overview");
  const [tab, setTab] = useState("all");
  const [showExport, setShowExport] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const related = (allTrips || []).filter(t =>
    t.id !== trip.id && (t.region === trip.region || t.author === trip.author)
  ).slice(0, 3);

  const handleShare = () => {
    const url = `${window.location.origin}/#trip/${trip.id}`;
    navigator.clipboard.writeText(url).then(() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); });
  };

  const handleTwitterShare = () => {
    const url = `${window.location.origin}/#trip/${trip.id}`;
    const text = `Check out this trip: ${trip.title} on TripCopycat`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.6)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(6px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"880px", boxShadow:`0 32px 64px rgba(44,62,80,0.2)`, overflow:"hidden", border:`1px solid ${C.tide}` }}>

          {/* header */}
          <div style={{ position:"relative", background:`linear-gradient(135deg,#2C1810 0%,#3D2B1F 100%)`, padding:"26px 30px", color:C.white, overflow:"hidden" }}>
            {trip.image && <img src={trip.image} alt={trip.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", opacity:0.35 }} />}
            <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", color:"rgba(255,255,255,0.95)", textTransform:"uppercase", marginBottom:"7px", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>{trip.region} · {trip.duration} · {trip.date}</div>
                <h2 style={{ margin:0, fontSize:"27px", fontWeight:700, fontFamily:"'Playfair Display',Georgia,serif", color:"#FFFFFF", textShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>{trip.title}</h2>
                <div style={{ marginTop:"4px", fontSize:"14px", color:"rgba(255,255,255,0.95)", fontWeight:500, textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>{trip.destination}</div>
              </div>
              <div style={{ display:"flex", gap:"7px", alignItems:"flex-start" }}>
                <button onClick={handleShare} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"6px 13px", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>{shareCopied ? "✓ Copied!" : "🔗 Share"}</button>
                <button onClick={handleTwitterShare} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"6px 13px", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>𝕏</button>
                <button onClick={() => onBookmark && onBookmark(trip.id)} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"6px 13px", cursor:"pointer", fontSize:"12px", fontWeight:700 }} title={isBookmarked ? "Remove bookmark" : "Bookmark"}>{isBookmarked ? "🔖 Saved" : "🏷️ Save"}</button>
                <button onClick={() => setShowExport(true)} style={{ background:"rgba(196,168,130,0.2)", border:"1px solid rgba(196,168,130,0.4)", color:"#FAF7F2", borderRadius:"8px", padding:"6px 13px", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>📤 Export</button>
                <button onClick={onClose} style={{ background:"rgba(196,168,130,0.2)", border:"none", color:"#FAF7F2", borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
              </div>
            </div>
            <div style={{ marginTop:"12px", display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.95)", fontWeight:500, textShadow:"0 1px 3px rgba(0,0,0,0.4)" }}>by <strong>{trip.author}</strong></span>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.95)", fontWeight:500, textShadow:"0 1px 3px rgba(0,0,0,0.4)" }}>{trip.travelers}</span>
              {trip.tags.map(t => <span key={t} style={{ fontSize:"10px", fontWeight:700, padding:"2px 9px", borderRadius:"20px", background:"rgba(0,0,0,0.3)", color:"#FFFFFF", border:"1px solid rgba(255,255,255,0.4)" }}>{t}</span>)}
            </div>
          </div>

          {/* tabs */}
          <div style={{ display:"flex", borderBottom:`1px solid ${C.tide}`, background:C.seafoam }}>
            {[{id:"overview",l:"Overview"},{id:"daily",l:"📅 Daily Itinerary"},{id:"details",l:"🗂️ All Details"}].map(t => (
              <button key={t.id} onClick={() => setView(t.id)} style={{ padding:"12px 20px", fontSize:"13px", fontWeight:700, border:"none", cursor:"pointer", background:"transparent", color:view===t.id?C.azureDeep:C.muted, borderBottom:view===t.id?`2px solid ${C.amber}`:"2px solid transparent", transition:"all .15s" }}>{t.l}</button>
            ))}
          </div>

          {view === "overview" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:`1px solid ${C.tide}` }}>
                <div style={{ padding:"20px 24px", borderRight:`1px solid ${C.tide}`, background:C.white }}>
                  <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:C.green, marginBottom:"8px" }}>❤️ What They Loved</div>
                  <p style={{ margin:0, fontSize:"13px", color:C.slate, lineHeight:1.75, fontWeight:500 }}>{trip.loves}</p>
                </div>
                <div style={{ padding:"20px 24px", background:C.white }}>
                  <div style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:C.amber, marginBottom:"8px" }}>🔄 Do Differently</div>
                  <p style={{ margin:0, fontSize:"13px", color:C.slate, lineHeight:1.75, fontWeight:500 }}>{trip.doNext}</p>
                </div>
              </div>
              <div style={{ padding:"20px 24px", background:C.white }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"9px", marginBottom:"18px" }}>
                  {Object.entries(catConfig).map(([key,cfg]) => (
                    <div key={key} style={{ textAlign:"center", padding:"12px 6px", background:C.seafoam, borderRadius:"10px", border:`1px solid ${C.tide}` }}>
                      <div style={{ fontSize:"17px", marginBottom:"3px" }}>{cfg.label.split(" ")[0]}</div>
                      <div style={{ fontSize:"19px", fontWeight:800, color:cfg.color }}>{trip[key]?.length||0}</div>
                      <div style={{ fontSize:"9px", color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{key}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setView("daily")} style={{ width:"100%", padding:"12px", background:C.cta, color:C.white, border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                  📅 View Day-by-Day Itinerary →
                </button>
              </div>
            </div>
          )}

          {view === "daily" && (
            <div style={{ padding:"24px 28px", background:C.white }}>
              {trip.days?.length
                ? <DailyItinerary days={trip.days} />
                : <div style={{ textAlign:"center", padding:"56px 20px", color:C.muted }}><div style={{ fontSize:"34px", marginBottom:"12px" }}>📅</div><div style={{ fontWeight:600 }}>No daily itinerary yet</div></div>
              }
            </div>
          )}

          {view === "details" && (
            <div style={{ padding:"24px 28px", background:C.white }}>
              <div style={{ display:"flex", gap:"5px", marginBottom:"20px", flexWrap:"wrap" }}>
                {["all",...Object.keys(catConfig)].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding:"5px 12px", fontSize:"11px", fontWeight:600, borderRadius:"8px", border:`1px solid ${tab===t?C.azure:C.tide}`, cursor:"pointer", background:tab===t?C.azure:C.white, color:tab===t?C.white:C.slateLight }}>
                    {t === "all" ? "All" : catConfig[t]?.label}
                  </button>
                ))}
              </div>
              {Object.entries(catConfig).map(([key,cfg]) => {
                if (tab !== "all" && tab !== key) return null;
                if (!trip[key]?.length) return null;
                return (
                  <div key={key} style={{ marginBottom:"26px" }}>
                    <div style={{ fontWeight:700, fontSize:"13px", marginBottom:"9px", display:"flex", alignItems:"center", gap:"7px" }}>
                      <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:cfg.color, display:"inline-block" }} />{cfg.label}
                    </div>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                      <thead><tr>{["Name","Details","💡 Tip"].map(h => <th key={h} style={{ textAlign:"left", padding:"7px 11px", background:C.seafoam, color:C.slateLight, fontWeight:600, fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
                      <tbody>{trip[key].map((it,i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${C.seafoamDeep}` }}>
                          <td style={{ padding:"9px 11px", fontWeight:600, color:C.slate }}>{it.item}</td>
                          <td style={{ padding:"9px 11px", color:C.slate }}>{it.detail}</td>
                          <td style={{ padding:"9px 11px", color:C.slateMid, fontStyle:"italic" }}>{it.tip}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Related trips */}
      {related.length > 0 && (
        <div style={{ padding:"20px 28px", borderTop:`1px solid ${C.tide}`, background:C.seafoam }}>
          <div style={{ fontSize:"11px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>You Might Also Like</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))", gap:"12px" }}>
            {related.map(t => {
              const grad = REGION_GRADIENTS[t.region] || "linear-gradient(135deg,#8B7355,#C4A882)";
              return (
                <div key={t.id} onClick={() => { onClose(); setTimeout(() => window.__openTrip && window.__openTrip(t), 100); }} style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, overflow:"hidden", cursor:"pointer", transition:"all .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.amber}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.tide}>
                  <div style={{ height:"70px", background:t.image?"transparent":grad, position:"relative", overflow:"hidden" }}>
                    {t.image && <img src={t.image} alt={t.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                    {t.image && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.2)" }} />}
                  </div>
                  <div style={{ padding:"9px 11px" }}>
                    <div style={{ fontSize:"11px", fontWeight:700, color:C.slate, lineHeight:1.3, marginBottom:"3px" }}>{t.title}</div>
                    <div style={{ fontSize:"10px", color:C.muted }}>{t.destination} · {t.duration}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showExport && <ExportModal trip={trip} onClose={() => setShowExport(false)} />}
    </>
  );
}


// ── Region gradient map for card image placeholders ──────────────────────────

// ── Trip Card ─────────────────────────────────────────────────────────────────

function TripCard({ trip, onClick, isBookmarked, onBookmark }) {
  const grad = REGION_GRADIENTS[trip.region] || "linear-gradient(135deg,#8B7355,#C4A882)";
  const emoji = REGION_EMOJI[trip.region] || "🌍";
  return (
    <div onClick={() => onClick(trip)} style={{ background:C.white, border:`${trip.featured?"2px solid #C4A882":"1px solid "+C.tide}`, borderRadius:"16px", overflow:"hidden", cursor:"pointer", transition:"all .2s", boxShadow:trip.featured?`0 4px 20px rgba(196,168,130,0.25)`:`0 2px 12px rgba(44,62,80,0.07)` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 10px 32px rgba(28,43,58,0.15)`; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor=C.amber; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=trip.featured?`0 4px 20px rgba(196,168,130,0.25)`:`0 2px 12px rgba(44,62,80,0.07)`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=trip.featured?"#C4A882":C.tide; }}>
      {/* Image / placeholder */}
      <div style={{ height:"148px", background:trip.image ? "transparent" : grad, position:"relative", display:"flex", alignItems:"flex-end", padding:"14px", overflow:"hidden" }}>
        {trip.image
          ? <img src={trip.image} alt={trip.title} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }} />
          : <span style={{ fontSize:"42px", position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", opacity:0.35 }}>{emoji}</span>
        }
        {trip.image && <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%)" }} />}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.8)", textTransform:"uppercase", marginBottom:"3px" }}>{trip.region}</div>
          <div style={{ fontSize:"16px", fontWeight:700, color:"#FFFFFF", fontFamily:"'Playfair Display',Georgia,serif", lineHeight:1.2, textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>{trip.title}</div>
        </div>
        <div style={{ position:"absolute", top:"12px", right:"12px", background:"rgba(0,0,0,0.25)", borderRadius:"20px", padding:"3px 10px", fontSize:"10px", color:"rgba(255,255,255,0.9)", fontWeight:600 }}>{trip.duration}</div>
        {trip.featured && <div style={{ position:"absolute", top:"12px", left:"44px", background:"linear-gradient(135deg,#C4A882,#A8896A)", borderRadius:"20px", padding:"3px 10px", fontSize:"10px", color:"#fff", fontWeight:700, display:"flex", alignItems:"center", gap:"4px" }}>✦ Featured</div>}
        {/* Bookmark button */}
        <button onClick={e => { e.stopPropagation(); onBookmark && onBookmark(trip.id); }} style={{ position:"absolute", top:"10px", left:"12px", background:"rgba(0,0,0,0.3)", border:"none", borderRadius:"50%", width:"28px", height:"28px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this trip"}>
          {isBookmarked ? "🔖" : "🏷️"}
        </button>
      </div>
      {/* Card body */}
      <div style={{ padding:"16px 18px" }}>
        <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"9px" }}>{trip.destination}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"10px" }}>
          {trip.tags.map(t => <span key={t} style={{ fontSize:"10px", fontWeight:600, padding:"2px 8px", borderRadius:"20px", background:C.seafoam, color:C.slateMid, border:`1px solid ${C.tide}` }}>{t}</span>)}
        </div>
        <div style={{ fontSize:"12px", color:C.slateMid, lineHeight:1.65, marginBottom:"12px" }}>
          <span style={{ fontWeight:700, color:C.green }}>❤️ </span>{trip.loves.substring(0,100)}…
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${C.seafoamDeep}`, paddingTop:"10px" }}>
          <div style={{ fontSize:"11px", color:C.muted }}>by <strong onClick={e => { e.stopPropagation(); window.__setViewingProfile && window.__setViewingProfile(trip.author); }} style={{ color:C.amber, cursor:"pointer", textDecoration:"underline", textDecorationStyle:"dotted" }}>{trip.author}</strong> · {trip.date}</div>
          <div style={{ fontSize:"11px", color:C.slateMid, fontWeight:600 }}>{trip.travelers}</div>
        </div>
      </div>
    </div>
  );
}

// ── Add Trip Modal ────────────────────────────────────────────────────────────

function AddTripModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: prefillData?.destination ? `${prefillData.destination} Trip` : "",
    destination: prefillData?.destination || "",
    region: prefillData?.region || "Europe",
    duration: prefillData?.duration || "",
    travelers: prefillData?.travelers || "",
    date: "",
    tags: prefillData?.tags || [],
    loves: prefillData?.loves || "",
    doNext: prefillData?.doNext || "",
    airfare: [{item:"",detail:"",tip:""}],
    hotels: prefillData?.hotels?.length ? prefillData.hotels : [{item:"",detail:"",tip:""}],
    restaurants: prefillData?.restaurants?.length ? prefillData.restaurants : [{item:"",detail:"",tip:""}],
    bars: prefillData?.bars?.length ? prefillData.bars : [{item:"",detail:"",tip:""}],
    activities: prefillData?.activities?.length ? prefillData.activities : [{item:"",detail:"",tip:""}],
    days: prefillData?.days || []
  });

  const updRow   = (cat,i,f,v) => setForm(p => { const u=[...p[cat]]; u[i]={...u[i],[f]:v}; return {...p,[cat]:u}; });
  const addRow   = cat => setForm(p => ({...p,[cat]:[...p[cat],{item:"",detail:"",tip:""}]}));
  const toggleTag = tag => setForm(p => ({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}));
  const inp = { width:"100%", padding:"8px 11px", borderRadius:"7px", border:`1px solid ${C.tide}`, fontSize:"12px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate };
  const lbl = { fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.65)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"36px 16px", overflowY:"auto", backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"680px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.2)`, border:`1px solid ${C.tide}` }}>
        {/* header */}
        <div style={{ background:C.cta, padding:"24px 30px", color:C.white, display:"flex", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex", gap:"7px", marginBottom:"9px", alignItems:"center" }}>
              {["Overview","Feedback","Details"].map((s,i) => (<span key={s} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <span style={{ width:"19px", height:"19px", borderRadius:"50%", background:step-1===i?C.white:"rgba(255,255,255,.25)", color:step-1===i?C.azureDark:C.white, fontSize:"10px", fontWeight:800, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{i+1}</span>
                <span style={{ fontSize:"10px", opacity:step-1===i?1:0.55, fontWeight:step-1===i?700:400 }}>{s}</span>
                {i<2&&<span style={{ opacity:.35, fontSize:"10px" }}>›</span>}
              </span>))}
            </div>
            <h2 style={{ margin:0, fontSize:"19px", fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700 }}>
              {["Overview","Feedback","Details"][step-1]}
            </h2>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.2)", border:"none", color:C.white, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>

        <div style={{ padding:"24px 30px", background:C.white }}>
          {step === 1 && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Trip Title</label><input style={inp} placeholder="e.g. Tokyo Family Adventure" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
              <div><label style={lbl}>Destination</label><input style={inp} placeholder="e.g. Tokyo, Japan" value={form.destination} onChange={e=>setForm(p=>({...p,destination:e.target.value}))} /></div>
              <div><label style={lbl}>Region</label><select style={inp} value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}>{REGIONS.filter(r=>r!=="All Regions").map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label style={lbl}>Duration</label><input style={inp} placeholder="e.g. 10 days" value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} /></div>
              <div><label style={lbl}>Date</label><input style={inp} placeholder="e.g. March 2024" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Who Traveled</label><input style={inp} placeholder="e.g. Family (2 kids)" value={form.travelers} onChange={e=>setForm(p=>({...p,travelers:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"4px" }}>
                  {TAGS.filter(t=>t!=="All").map(tag=><button key={tag} onClick={()=>toggleTag(tag)} style={{ padding:"3px 11px", borderRadius:"20px", fontSize:"11px", fontWeight:600, cursor:"pointer", border:`1px solid ${form.tags.includes(tag)?C.azure:C.tide}`, background:form.tags.includes(tag)?C.azure:C.white, color:form.tags.includes(tag)?C.white:C.slateLight }}>{tag}</button>)}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              <div><label style={{...lbl,color:C.green}}>❤️ What did you love?</label><textarea style={{...inp,height:"90px",resize:"vertical"}} value={form.loves} onChange={e=>setForm(p=>({...p,loves:e.target.value}))} /></div>
              <div><label style={{...lbl,color:C.amber}}>🔄 What would you do differently?</label><textarea style={{...inp,height:"90px",resize:"vertical"}} value={form.doNext} onChange={e=>setForm(p=>({...p,doNext:e.target.value}))} /></div>
            </div>
          )}
          {step === 3 && (
            <div>
              {Object.entries(catConfig).map(([key,cfg]) => (
                <div key={key} style={{ marginBottom:"18px" }}>
                  <div style={{ fontWeight:700, fontSize:"12px", marginBottom:"6px", display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:cfg.color, display:"inline-block" }} />{cfg.label}
                  </div>
                  {form[key].map((row,i) => (
                    <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"6px", marginBottom:"6px" }}>
                      <input style={inp} placeholder="Name" value={row.item} onChange={e=>updRow(key,i,"item",e.target.value)} />
                      <input style={inp} placeholder="Details / Cost" value={row.detail} onChange={e=>updRow(key,i,"detail",e.target.value)} />
                      <input style={inp} placeholder="Insider tip" value={row.tip} onChange={e=>updRow(key,i,"tip",e.target.value)} />
                    </div>
                  ))}
                  <button onClick={()=>addRow(key)} style={{ fontSize:"11px", color:cfg.color, background:"none", border:`1px dashed ${cfg.color}`, padding:"3px 10px", borderRadius:"5px", cursor:"pointer", fontWeight:600 }}>+ Add row</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:"12px 30px 24px", display:"flex", justifyContent:"space-between", background:C.seafoam, borderTop:`1px solid ${C.tide}` }}>
          <button onClick={()=>step>1?setStep(s=>s-1):onClose()} style={{ padding:"8px 18px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>{step>1?"← Back":"Cancel"}</button>
          <button onClick={()=>step<3?setStep(s=>s+1):(onAdd({...form,id:Date.now(),author:"You"}),onClose())} style={{ padding:"8px 18px", borderRadius:"8px", border:"none", background:C.cta, color:C.white, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
            {step<3?"Next →":"✓ Publish Itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Submit Trip Modal ─────────────────────────────────────────────────────────
function SubmitTripModal({ onClose, currentUser, displayName, onSubmitSuccess, prefillData }) {
  const [step, setStep] = useState(prefillData ? "form" : "prompt");
  const [pastedText, setPastedText] = useState("");
  const [filterResult, setFilterResult] = useState(null);
  const [submitterName, setSubmitterName] = useState(displayName || "");
  const [submitterEmail, setSubmitterEmail] = useState(currentUser?.email || "");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const photoRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/heic","image/heif","image/gif","image/avif","image/tiff"];
    if (!allowed.includes(file.type)) { setPhotoError("File type not supported. Please use JPG, PNG, WEBP, HEIC, or similar."); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError("Photo must be under 5MB."); return; }
    setPhotoError("");
    setCoverPhoto(file);
    setCoverPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async () => {
    if (!coverPhoto) return null;
    const ext = coverPhoto.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("trip-photos").upload(path, coverPhoto, { contentType: coverPhoto.type, upsert: false });
    if (error) { console.error("Photo upload error:", error); return null; }
    const { data } = supabase.storage.from("trip-photos").getPublicUrl(path);
    return data.publicUrl;
  };
  const [form, setForm] = useState({
    title:"", destination:"", region:"Europe", duration:"", travelers:"", date:"", tags:[], loves:"", doNext:"",
    airfare:[{item:"",detail:"",tip:""}], hotels:[{item:"",detail:"",tip:""}],
    restaurants:[{item:"",detail:"",tip:""}], bars:[{item:"",detail:"",tip:""}],
    activities:[{item:"",detail:"",tip:""}], days:[]
  });

  const inp = { width:"100%", padding:"8px 11px", borderRadius:"7px", border:`1px solid ${C.tide}`, fontSize:"12px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate };
  const lbl = { fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" };

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_SUBMISSION_PROMPT);
    setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const parseAIOutput = () => {
    const raw = pastedText;
    const text = raw.replace(/\*\*/g, "").replace(/\r\n/g, "\n");

    const get = (label) => {
      const re = new RegExp("[-*]?\\s*" + label + "[:\\s]+([^\\n]+)", "i");
      const m = text.match(re);
      return m ? m[1].replace(/^[-*\s]+/, "").trim() : "";
    };

    const getBlock = (label, ...nextLabels) => {
      const escaped = nextLabels.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const re = new RegExp(label + "[:\\s*]+([\\s\\S]*?)(?=" + escaped + "|$)", "i");
      const m = text.match(re);
      if (!m) return "";
      return m[1].replace(/^[\s\n]+/, "").replace(/[\s\n]+$/, "").replace(/^[-*]\s*/gm, "").trim();
    };

    const parseCategory = (label, nextLabel) => {
      const block = getBlock(label, nextLabel || "~~~END~~~");
      if (!block) return [];
      const rows = [];
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      let current = null;
      lines.forEach(line => {
        const isCostLine = /cost[:\s]|~\$|\$\d|budget|splurge|moderate|free|low cost|\d+ night/i.test(line) && !/tip[:\s]/i.test(line);
        const isTipLine  = /^tip[:\s]/i.test(line);
        const isHeader   = !isCostLine && !isTipLine && /^[A-Z]/.test(line) && !line.startsWith("-");
        if (isHeader && line.length > 2) {
          if (current) rows.push(current);
          current = { item: line.replace(/^[-*]\s*/, ""), detail: "", tip: "" };
        } else if (current && isCostLine) {
          current.detail = line.replace(/.*?:\s*/, "").trim();
        } else if (current && isTipLine) {
          current.tip = line.replace(/^tip[:\s]*/i, "").trim();
        } else if (current && !current.tip) {
          current.tip = line.replace(/^[-*]\s*/, "").trim();
        }
      });
      if (current) rows.push(current);
      return rows.filter(r => r.item.length > 1);
    };

    const parseDays = () => {
      const block = getBlock("DAILY ITINERARY", "~~~END~~~");
      if (!block) return [];
      const days = [];
      const dayBlocks = block.split(/\n(?=Day \d+)/i);
      dayBlocks.forEach(db => {
        const lines = db.split("\n").map(l => l.replace(/\*\*/g,"").trim()).filter(Boolean);
        if (!lines.length) return;
        const hm = lines[0].match(/Day\s*(\d+)\s*[\u2013\-\u2014]\s*(.+?)\s*[\u2013\-\u2014]\s*(.+)/i) ||
                   lines[0].match(/Day\s*(\d+)\s*[\u2013\-\u2014]\s*(.+)/i);
        if (!hm) return;
        const dayNum = parseInt(hm[1]);
        const title  = (hm[2] || "").trim();
        const dateStr = (hm[3] || "").trim();
        const items = [];
        lines.slice(1).forEach(line => {
          const m = line.match(/^(.+?)\s*[\u2013\-\u2014]\s*(activity|dining|bar|hotel|transport|travel)\s*[\u2013\-\u2014]\s*(.+)/i);
          if (m) {
            const type = m[2].toLowerCase().replace("dining","restaurant").replace("travel","transport");
            items.push({ time: m[1].trim(), type, label: m[3].trim(), note: "" });
          }
        });
        days.push({ day: dayNum, date: dateStr, title, items });
      });
      return days;
    };

    const parseTags = () => {
      const tagLine = get("Tags");
      if (!tagLine) return [];
      return tagLine.split(/[,;]/).map(t => t.trim().toLowerCase()).filter(t => TAGS.includes(t));
    };

    const parseRegion = () => {
      const r = get("Region");
      return REGIONS.find(reg => reg !== "All Regions" && r.toLowerCase().includes(reg.toLowerCase())) || "";
    };

    const airfare     = parseCategory("FLIGHTS",      "HOTELS");
    const hotels      = parseCategory("HOTELS",       "RESTAURANTS");
    const restaurants = parseCategory("RESTAURANTS",  "BARS");
    const bars        = parseCategory("BARS",          "ACTIVITIES");
    const activities  = parseCategory("ACTIVITIES",   "DAILY ITINERARY");
    const days        = parseDays();
    const tags        = parseTags();
    const region      = parseRegion();

    setForm(p => ({
      ...p,
      title:        get("Title")        || p.title,
      destination:  get("Destination")  || p.destination,
      region:       region              || p.region,
      date:         get("Date")         || p.date,
      duration:     get("Duration")     || p.duration,
      travelers:    get("Who traveled") || p.travelers,
      loves:        getBlock("WHAT I LOVED", "WHAT I WOULD DO DIFFERENTLY", "FLIGHTS") || p.loves,
      doNext:       getBlock("WHAT I WOULD DO DIFFERENTLY", "FLIGHTS", "HOTELS")       || p.doNext,
      tags:         tags.length        ? tags        : p.tags,
      airfare:      airfare.length     ? airfare     : p.airfare,
      hotels:       hotels.length      ? hotels      : p.hotels,
      restaurants:  restaurants.length ? restaurants : p.restaurants,
      bars:         bars.length        ? bars        : p.bars,
      activities:   activities.length  ? activities  : p.activities,
      days:         days.length        ? days        : p.days,
    }));
    setStep("form");
  };

  const updRow = (cat,i,f,v) => setForm(p => { const u=[...p[cat]]; u[i]={...u[i],[f]:v}; return {...p,[cat]:u}; });
  const addRow = cat => setForm(p => ({...p,[cat]:[...p[cat],{item:"",detail:"",tip:""}]}));
  const delRow = (cat,i) => setForm(p => ({...p,[cat]:p[cat].filter((_,idx)=>idx!==i)}));
  const toggleTag = tag => setForm(p => ({...p,tags:p.tags.includes(tag)?p.tags.filter(t=>t!==tag):[...p.tags,tag]}));

  const handleSubmit = async () => {
    if (!submitterName || !submitterEmail) { alert("Please add your name and email."); return; }
    setStep("submitting");
    const photoUrl = await uploadPhoto();
    const tripWithPhoto = { ...form, image: photoUrl || "" };
    const result = runContentFilter(tripWithPhoto);
    setFilterResult(result);
    await supabase.from("submissions").insert([{
      trip_data: tripWithPhoto, submitter_name: submitterName, submitter_email: submitterEmail,
      status: result.passed ? "pending" : "flagged",
      ai_flagged: !result.passed,
      ai_flag_reason: result.flags.join("; "),
      user_id: currentUser?.id || null
    }]);
    setStep("flagged");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:2000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"720px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.22)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"20px 28px", borderBottom:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Submit a Trip</div>
            <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"2px" }}>Share your trip with the TripCopycat community</div>
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>x</button>
        </div>

        {step === "prompt" && (
          <div style={{ padding:"28px", maxHeight:"70vh", overflowY:"auto" }}>
            <div style={{ textAlign:"center", marginBottom:"24px" }}>
              <div style={{ fontSize:"32px", marginBottom:"10px" }}>✈️</div>
              <div style={{ fontSize:"16px", fontWeight:700, color:C.slate, marginBottom:"6px" }}>How would you like to build your itinerary?</div>
              <div style={{ fontSize:"13px", color:C.slateLight, lineHeight:1.6 }}>Choose the fastest path for you.</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <button onClick={() => setStep("ai-prompt")} style={{ padding:"18px", borderRadius:"12px", border:`2px solid ${C.azure}`, background:C.seafoam, cursor:"pointer", textAlign:"left" }}>
                <div style={{ fontSize:"22px", marginBottom:"8px" }}>🤖</div>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.slate }}>Use AI Prompt</div>
                <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"3px", lineHeight:1.5 }}>Paste into Claude or ChatGPT, answer questions, paste back. Fastest way to build.</div>
              </button>
              <button onClick={() => setStep("form")} style={{ padding:"18px", borderRadius:"12px", border:`1px solid ${C.tide}`, background:C.white, cursor:"pointer", textAlign:"left" }}>
                <div style={{ fontSize:"22px", marginBottom:"8px" }}>✏️</div>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.slate }}>Fill Form Manually</div>
                <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"3px", lineHeight:1.5 }}>Enter your trip details directly into the form fields.</div>
              </button>
            </div>
            <button onClick={() => setStep("photo-import")} style={{ width:"100%", padding:"18px", borderRadius:"12px", border:`2px solid ${C.amber}`, background:C.amberBg, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"16px" }}>
              <div style={{ fontSize:"28px", flexShrink:0 }}>📸</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px" }}>
                  <div style={{ fontSize:"13px", fontWeight:700, color:C.slate }}>Smart Import From Photos</div>
                  <span style={{ fontSize:"9px", fontWeight:700, background:C.amber, color:C.white, padding:"2px 7px", borderRadius:"20px" }}>NEW</span>
                </div>
                <div style={{ fontSize:"11px", color:C.slateLight, lineHeight:1.5 }}>Upload up to 30 trip photos. AI reads GPS, identifies venues from signage, and reconstructs your itinerary automatically.</div>
              </div>
            </button>
          </div>
        )}

        {step === "photo-import" && (
          <PhotoImportModal
            onClose={() => setStep("prompt")}
            onComplete={(data) => {
              setForm(p => ({
                ...p,
                title: data.destination ? `${data.destination} Trip` : p.title,
                destination: data.destination || p.destination,
                region: data.region || p.region,
                duration: data.duration || p.duration,
                travelers: data.travelers || p.travelers,
                tags: data.tags?.length ? data.tags : p.tags,
                loves: data.loves || p.loves,
                doNext: data.doNext || p.doNext,
                hotels: data.hotels?.length ? data.hotels : p.hotels,
                restaurants: data.restaurants?.length ? data.restaurants : p.restaurants,
                bars: data.bars?.length ? data.bars : p.bars,
                activities: data.activities?.length ? data.activities : p.activities,
                days: data.days?.length ? data.days : p.days,
              }));
              setStep("form");
            }}
            skipCloseOnComplete
          />
        )}

        {step === "ai-prompt" && (
          <div style={{ padding:"24px 28px", maxHeight:"70vh", overflowY:"auto" }}>
            <div style={{ fontSize:"13px", color:C.slateLight, marginBottom:"14px", lineHeight:1.6 }}>Copy this prompt and paste it into Claude, ChatGPT, or any AI. Answer its questions about your trip. When done, copy the full output and paste it below.</div>
            <pre style={{ background:C.seafoam, border:`1px solid ${C.tide}`, borderRadius:"10px", padding:"14px", fontSize:"10.5px", lineHeight:1.7, color:C.slateMid, whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight:"200px", overflowY:"auto", fontFamily:"monospace", marginBottom:"14px" }}>
              {AI_SUBMISSION_PROMPT}
            </pre>
            <button onClick={copyPrompt} style={{ width:"100%", padding:"10px", borderRadius:"8px", border:"none", background:copiedPrompt?C.green:`linear-gradient(135deg,${C.azureDark},${C.azure})`, color:C.white, fontWeight:700, fontSize:"13px", cursor:"pointer", marginBottom:"16px", transition:"background .2s" }}>
              {copiedPrompt ? "Copied!" : "Copy Prompt"}
            </button>
            <div style={{ fontSize:"12px", fontWeight:600, color:C.slate, marginBottom:"6px" }}>Paste your AI output here:</div>
            <textarea value={pastedText} onChange={e=>setPastedText(e.target.value)} placeholder="Paste the full output from your AI session here..." style={{ width:"100%", height:"130px", padding:"10px 12px", borderRadius:"8px", border:`1px solid ${C.tide}`, fontSize:"12px", outline:"none", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit", color:C.slate }} />
            <div style={{ display:"flex", gap:"10px", marginTop:"12px" }}>
              <button onClick={() => setStep("prompt")} style={{ padding:"9px 18px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Back</button>
              <button onClick={parseAIOutput} disabled={pastedText.length < 50} style={{ flex:1, padding:"9px", borderRadius:"8px", border:"none", background:pastedText.length<50?C.tide:`linear-gradient(135deg,${C.azureDark},${C.azure})`, color:C.white, fontWeight:700, fontSize:"13px", cursor:pastedText.length<50?"not-allowed":"pointer" }}>
                Auto-populate form
              </button>
            </div>
          </div>
        )}

        {step === "form" && (
          <div style={{ padding:"20px 28px", maxHeight:"65vh", overflowY:"auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Trip Title</label><input style={inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} /></div>
              <div><label style={lbl}>Destination</label><input style={inp} value={form.destination} onChange={e=>setForm(p=>({...p,destination:e.target.value}))} /></div>
              <div><label style={lbl}>Region</label><select style={inp} value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}>{REGIONS.filter(r=>r!=="All Regions").map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label style={lbl}>Duration</label><input style={inp} value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} /></div>
              <div><label style={lbl}>Date</label><input style={inp} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Who Traveled</label><input style={inp} value={form.travelers} onChange={e=>setForm(p=>({...p,travelers:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Tags</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"3px" }}>
                  {TAGS.filter(t=>t!=="All").map(tag=><button key={tag} onClick={()=>toggleTag(tag)} style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:600, cursor:"pointer", border:`1px solid ${form.tags.includes(tag)?C.azure:C.tide}`, background:form.tags.includes(tag)?C.azure:C.white, color:form.tags.includes(tag)?C.white:C.slateLight }}>{tag}</button>)}
                </div>
              </div>

              <div style={{ gridColumn:"1/-1" }}><label style={{...lbl,color:C.green}}>What did you love?</label><textarea style={{...inp,height:"100px",resize:"vertical"}} value={form.loves} onChange={e=>setForm(p=>({...p,loves:e.target.value}))} /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={{...lbl,color:C.amber}}>What would you do differently?</label><textarea style={{...inp,height:"100px",resize:"vertical"}} value={form.doNext} onChange={e=>setForm(p=>({...p,doNext:e.target.value}))} /></div>
            </div>
            {Object.entries(catConfig).map(([key,cfg]) => (
              <div key={key} style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"12px", fontWeight:700, color:cfg.color, marginBottom:"6px" }}>{cfg.label}</div>
                {form[key].map((row,i) => (
                  <div key={i} style={{ background:C.seafoam, borderRadius:"8px", padding:"10px", marginBottom:"8px", border:`1px solid ${C.tide}` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"6px", marginBottom:"5px" }}>
                      <input style={inp} placeholder="Name" value={row.item} onChange={e=>updRow(key,i,"item",e.target.value)} />
                      <button onClick={()=>delRow(key,i)} style={{ padding:"5px 10px", borderRadius:"5px", border:`1px solid ${C.red}`, background:C.redBg, color:C.red, cursor:"pointer", fontSize:"12px" }}>✕</button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
                      <textarea style={{...inp, height:"52px", resize:"vertical", fontSize:"11px"}} placeholder="Details / Cost" value={row.detail} onChange={e=>updRow(key,i,"detail",e.target.value)} />
                      <textarea style={{...inp, height:"52px", resize:"vertical", fontSize:"11px"}} placeholder="Insider tip" value={row.tip} onChange={e=>updRow(key,i,"tip",e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={()=>addRow(key)} style={{ fontSize:"11px", color:cfg.color, background:"none", border:`1px dashed ${cfg.color}`, padding:"3px 10px", borderRadius:"5px", cursor:"pointer", fontWeight:600 }}>+ Add</button>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${C.tide}`, paddingTop:"14px", marginTop:"6px" }}>
              <div style={{ fontSize:"12px", fontWeight:700, color:C.slate, marginBottom:"6px" }}>📸 Cover Photo <span style={{ fontWeight:400, color:C.muted }}>(optional)</span></div>
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,image/avif,image/tiff" style={{ display:"none" }} onChange={handlePhotoChange} />
              {coverPhotoPreview ? (
                <div style={{ position:"relative", marginBottom:"8px" }}>
                  <img src={coverPhotoPreview} alt="Cover preview" style={{ width:"100%", height:"140px", objectFit:"cover", borderRadius:"10px", border:`1px solid ${C.tide}` }} />
                  <button onClick={() => { setCoverPhoto(null); setCoverPhotoPreview(null); photoRef.current.value=""; }} style={{ position:"absolute", top:"8px", right:"8px", background:"rgba(0,0,0,0.5)", border:"none", color:C.white, borderRadius:"50%", width:"26px", height:"26px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              ) : (
                <div onClick={() => photoRef.current.click()} style={{ border:`2px dashed ${C.tide}`, borderRadius:"10px", padding:"20px", textAlign:"center", cursor:"pointer", background:C.seafoam, marginBottom:"8px" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.amber}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.tide}>
                  <div style={{ fontSize:"24px", marginBottom:"6px" }}>🖼️</div>
                  <div style={{ fontSize:"12px", fontWeight:600, color:C.slateMid }}>Upload a cover photo</div>
                  <div style={{ fontSize:"10px", color:C.muted, marginTop:"3px" }}>JPG, PNG, WEBP, HEIC · Max 5MB</div>
                </div>
              )}
              {photoError && <div style={{ fontSize:"11px", color:C.red, marginBottom:"6px" }}>{photoError}</div>}
            </div>

            <div style={{ borderTop:`1px solid ${C.tide}`, paddingTop:"14px", marginTop:"6px" }}>
              <div style={{ fontSize:"12px", fontWeight:700, color:C.slate, marginBottom:"10px" }}>Your details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div><label style={lbl}>Your Name</label><input style={inp} value={submitterName} onChange={e=>setSubmitterName(e.target.value)} /></div>
                <div><label style={lbl}>Your Email</label><input style={inp} value={submitterEmail} onChange={e=>setSubmitterEmail(e.target.value)} /></div>
              </div>
              <div style={{ fontSize:"10px", color:C.muted, marginTop:"5px" }}>Email never displayed publicly.</div>
            </div>
          </div>
        )}

        {step === "submitting" && (
          <div style={{ padding:"60px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"36px", marginBottom:"14px" }}>🔍</div>
            <div style={{ fontSize:"16px", fontWeight:700, color:C.slate }}>Reviewing submission…</div>
            <div style={{ fontSize:"12px", color:C.slateLight, marginTop:"6px" }}>Running content checks.</div>
          </div>
        )}

        {step === "done" && (
          <div style={{ padding:"60px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:"14px" }}>🎉</div>
            <div style={{ fontSize:"20px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif", marginBottom:"8px" }}>Itinerary Published!</div>
            <div style={{ fontSize:"13px", color:C.slateLight, maxWidth:"380px", margin:"0 auto 24px", lineHeight:1.6 }}>Your trip passed all checks and is now live on TripCopycat.</div>
            <button onClick={onClose} style={{ padding:"11px 28px", borderRadius:"10px", border:"none", background:C.cta, color:C.white, fontWeight:700, fontSize:"13px", cursor:"pointer" }}>View the site</button>
          </div>
        )}

        {step === "flagged" && (
          <div style={{ padding:"50px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"40px", marginBottom:"14px" }}>🎉</div>
            <div style={{ fontSize:"18px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif", marginBottom:"8px" }}>Trip Submitted!</div>
            <div style={{ fontSize:"13px", color:C.slateLight, maxWidth:"380px", margin:"0 auto 16px", lineHeight:1.6 }}>Thanks for contributing to TripCopycat! Your trip is under review and will be published shortly. We'll be in touch at <strong>{submitterEmail}</strong>.</div>
            <button onClick={onClose} style={{ padding:"11px 28px", borderRadius:"10px", border:"none", background:C.cta, color:C.ctaText, fontWeight:700, fontSize:"13px", cursor:"pointer" }}>Done</button>
          </div>
        )}

        {step === "form" && (
          <div style={{ padding:"14px 28px", borderTop:`1px solid ${C.tide}`, background:C.seafoam }}>
            <label style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"12px", cursor:"pointer" }}>
              <input type="checkbox" checked={agreedToTerms} onChange={e=>setAgreedToTerms(e.target.checked)} style={{ marginTop:"2px", accentColor:C.amber, width:"15px", height:"15px", flexShrink:0 }} />
              <span style={{ fontSize:"11px", color:C.slateMid, lineHeight:1.6 }}>
                I agree to the <span onClick={e=>{e.preventDefault();window.__setShowLegal&&window.__setShowLegal(true);}} style={{ color:C.amber, fontWeight:700, cursor:"pointer", textDecoration:"underline" }}>Terms of Service</span> and grant TripCopycat permission to share my itinerary with the community.
              </span>
            </label>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={() => setStep("prompt")} style={{ padding:"9px 18px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Back</button>
              <button onClick={handleSubmit} disabled={!agreedToTerms} style={{ padding:"9px 24px", borderRadius:"8px", border:"none", background:agreedToTerms?C.cta:C.tide, color:agreedToTerms?C.ctaText:C.muted, fontSize:"12px", fontWeight:700, cursor:agreedToTerms?"pointer":"not-allowed", transition:"all .15s" }}>Submit Trip</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Queue Modal ─────────────────────────────────────────────────────────
function AdminQueueModal({ onClose, onApprove }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    supabase.from("submissions").select("*").order("submitted_at", { ascending: false })
      .then(({ data }) => { setSubmissions(data || []); setLoading(false); });
  }, []);

  const approve = async (sub) => {
    const t = sub.trip_data;
    await supabase.from("trips").insert([{
      title:t.title, destination:t.destination, region:t.region,
      author_name:sub.submitter_name, author_email:sub.submitter_email,
      date:t.date, duration:t.duration, travelers:t.travelers,
      tags:t.tags||[], loves:t.loves, do_next:t.do_next||t.doNext||"",
      airfare:t.airfare||[], hotels:t.hotels||[], restaurants:t.restaurants||[],
      bars:t.bars||[], activities:t.activities||[], days:t.days||[],
      image:t.image||"", status:"published", user_id:sub.user_id||null
    }]);
    await supabase.from("submissions").update({ status:"approved", reviewed_at:new Date().toISOString() }).eq("id",sub.id);
    setSubmissions(p => p.map(s => s.id===sub.id ? {...s,status:"approved"} : s));
    if (onApprove) onApprove();
    setDetail(null);
  };

  const reject = async (sub) => {
    await supabase.from("submissions").update({ status:"rejected", reviewed_at:new Date().toISOString() }).eq("id",sub.id);
    setSubmissions(p => p.map(s => s.id===sub.id ? {...s,status:"rejected"} : s));
    setDetail(null);
  };

  const statusCol = { pending:C.amber, flagged:C.red, approved:C.green, rejected:C.muted };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"800px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.22)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"20px 28px", borderBottom:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Submission Queue</div>
            <div style={{ fontSize:"11px", color:C.slateLight, marginTop:"2px" }}>{submissions.filter(s=>s.status==="flagged"||s.status==="pending").length} awaiting review</div>
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>x</button>
        </div>
        <div style={{ padding:"16px 22px", maxHeight:"70vh", overflowY:"auto" }}>
          {loading && <div style={{ textAlign:"center", padding:"40px", color:C.muted }}>Loading…</div>}
          {!loading && submissions.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px", color:C.muted }}>
              <div style={{ fontSize:"32px", marginBottom:"10px" }}>📭</div>
              <div>No submissions yet</div>
            </div>
          )}
          {submissions.map(sub => (
            <div key={sub.id} style={{ background:C.white, border:`1px solid ${sub.status==="flagged"?C.red:C.tide}`, borderRadius:"12px", padding:"14px 16px", marginBottom:"10px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:700, color:C.slate }}>{sub.trip_data?.title||"Untitled"}</div>
                  <div style={{ fontSize:"11px", color:C.slateLight }}>{sub.trip_data?.destination} - {sub.submitter_name} - {sub.submitter_email}</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>{new Date(sub.submitted_at).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", background:(statusCol[sub.status]||C.muted)+"22", color:statusCol[sub.status]||C.muted, textTransform:"uppercase", flexShrink:0 }}>{sub.status}</span>
              </div>
              {sub.ai_flag_reason && (
                <div style={{ background:C.amberBg, borderRadius:"6px", padding:"7px 10px", marginBottom:"8px", fontSize:"11px", color:C.slateMid }}>
                  Flagged: {sub.ai_flag_reason}
                </div>
              )}
              {(sub.status==="flagged"||sub.status==="pending") && (
                <div style={{ display:"flex", gap:"7px" }}>
                  <button onClick={() => setDetail(sub)} style={{ padding:"6px 12px", borderRadius:"7px", border:`1px solid ${C.tide}`, background:C.seafoam, color:C.slateMid, fontSize:"11px", fontWeight:600, cursor:"pointer" }}>View</button>
                  <button onClick={() => approve(sub)} style={{ padding:"6px 12px", borderRadius:"7px", border:"none", background:C.green, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Approve</button>
                  <button onClick={() => reject(sub)} style={{ padding:"6px 12px", borderRadius:"7px", border:"none", background:C.red, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {detail && (
        <div style={{ position:"fixed", inset:0, zIndex:5000, background:"rgba(44,62,80,0.85)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setDetail(null)}>
          <div style={{ background:C.white, borderRadius:"16px", padding:"24px", maxWidth:"540px", width:"92%", maxHeight:"80vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:"16px", fontWeight:800, color:C.slate, marginBottom:"4px" }}>{detail.trip_data?.title}</div>
            <div style={{ fontSize:"11px", color:C.slateLight, marginBottom:"14px" }}>by {detail.submitter_name} - {detail.submitter_email}</div>
            <pre style={{ fontSize:"11px", color:C.slateMid, whiteSpace:"pre-wrap", wordBreak:"break-word", background:C.seafoam, padding:"12px", borderRadius:"8px", marginBottom:"16px" }}>
              {JSON.stringify(detail.trip_data, null, 2)}
            </pre>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => approve(detail)} style={{ flex:1, padding:"10px", borderRadius:"8px", border:"none", background:C.green, color:C.white, fontWeight:700, cursor:"pointer" }}>Approve</button>
              <button onClick={() => reject(detail)} style={{ flex:1, padding:"10px", borderRadius:"8px", border:"none", background:C.red, color:C.white, fontWeight:700, cursor:"pointer" }}>Reject</button>
              <button onClick={() => setDetail(null)} style={{ padding:"10px 14px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Auth & Profile Components ─────────────────────────────────────────────────

// ── Auth Modal (Login / Register) ─────────────────────────────────────────────
// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ onClose }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inp = { width:"100%", padding:"10px 13px", borderRadius:"8px", border:`1px solid ${C.tide}`, fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate, marginBottom:"10px" };

  const handleReset = async () => {
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"400px", overflow:"hidden", boxShadow:`0 32px 64px rgba(28,43,58,0.25)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"24px 28px", borderBottom:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Set New Password</div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>
        <div style={{ padding:"24px 28px" }}>
          {done ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"36px", marginBottom:"12px" }}>✅</div>
              <div style={{ fontSize:"14px", fontWeight:700, color:C.slate, marginBottom:"8px" }}>Password updated!</div>
              <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"20px" }}>You can now sign in with your new password.</div>
              <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:C.cta, color:C.ctaText, fontWeight:700, fontSize:"14px", cursor:"pointer" }}>Done</button>
            </div>
          ) : (
            <div>
              <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>New Password</label>
              <input style={inp} type="password" placeholder="At least 6 characters" value={password} onChange={e=>setPassword(e.target.value)} />
              <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>Confirm Password</label>
              <input style={inp} type="password" placeholder="Repeat your new password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleReset()} />
              {error && <div style={{ fontSize:"12px", color:C.red, background:C.redBg, padding:"8px 12px", borderRadius:"7px", marginBottom:"10px" }}>{error}</div>}
              <button onClick={handleReset} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:loading?C.tide:C.cta, color:loading?C.muted:C.ctaText, fontWeight:700, fontSize:"14px", cursor:loading?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif" }}>
                {loading ? "Updating…" : "Set New Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // login | register | forgot | reset-sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = { width:"100%", padding:"10px 13px", borderRadius:"8px", border:`1px solid ${C.tide}`, fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate, marginBottom:"10px" };

  const handleRegister = async () => {
    if (!displayName.trim()) { setError("Please enter a display name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert([{
        id: data.user.id,
        display_name: displayName.trim(),
        email: email.trim(),
        created_at: new Date().toISOString()
      }]);
    }
    setLoading(false);
    onSuccess({ user: data.user, displayName: displayName.trim() });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) { setError(loginError.message); setLoading(false); return; }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    setLoading(false);
    onSuccess({ user: data.user, displayName: profile?.display_name || email });
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://tripcopycat.com/reset-password"
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setMode("reset-sent");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:"20px" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"400px", overflow:"hidden", boxShadow:`0 32px 64px rgba(28,43,58,0.25)`, border:`1px solid ${C.tide}` }}>
        <div style={{ padding:"24px 28px", borderBottom:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : mode === "forgot" ? "Reset Password" : "Check Your Email"}
          </div>
          <button onClick={onClose} style={{ background:C.seafoamDeep, border:"none", color:C.slateLight, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
        </div>
        <div style={{ padding:"24px 28px" }}>

          {/* reset-sent confirmation */}
          {mode === "reset-sent" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"36px", marginBottom:"12px" }}>📧</div>
              <div style={{ fontSize:"14px", fontWeight:700, color:C.slate, marginBottom:"8px" }}>Reset link sent!</div>
              <div style={{ fontSize:"12px", color:C.slateLight, lineHeight:1.6, marginBottom:"20px" }}>Check your email at <strong>{email}</strong> for a link to reset your password.</div>
              <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:C.cta, color:C.ctaText, fontWeight:700, fontSize:"14px", cursor:"pointer" }}>Done</button>
            </div>
          )}

          {/* forgot password form */}
          {mode === "forgot" && (
            <div>
              <div style={{ fontSize:"12px", color:C.slateLight, marginBottom:"16px", lineHeight:1.6 }}>Enter your email and we'll send you a link to reset your password.</div>
              <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>Email</label>
              <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgotPassword()} />
              {error && <div style={{ fontSize:"12px", color:C.red, background:C.redBg, padding:"8px 12px", borderRadius:"7px", marginBottom:"10px" }}>{error}</div>}
              <button onClick={handleForgotPassword} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:loading?C.tide:C.cta, color:loading?C.muted:C.ctaText, fontWeight:700, fontSize:"14px", cursor:loading?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif" }}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <div style={{ textAlign:"center", marginTop:"14px" }}>
                <button onClick={() => { setMode("login"); setError(""); }} style={{ background:"none", border:"none", color:C.amber, fontWeight:700, cursor:"pointer", fontSize:"12px" }}>← Back to Sign In</button>
              </div>
            </div>
          )}

          {/* login / register */}
          {(mode === "login" || mode === "register") && (
            <div>
              <div style={{ display:"flex", background:C.seafoam, borderRadius:"10px", padding:"3px", marginBottom:"20px" }}>
                {[["login","Sign In"],["register","Create Account"]].map(([m,l]) => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, padding:"8px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700, background:mode===m?C.white:"transparent", color:mode===m?C.slate:C.muted, boxShadow:mode===m?`0 1px 4px rgba(28,43,58,0.1)`:"none", transition:"all .15s" }}>{l}</button>
                ))}
              </div>
              {mode === "register" && (
                <div>
                  <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>Display Name</label>
                  <input style={inp} placeholder="How you'll appear on your trips" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
                </div>
              )}
              <div>
                <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>Email</label>
                <input style={inp} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" }}>Password</label>
                <input style={inp} type="password" placeholder={mode==="register"?"At least 6 characters":"Your password"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?handleLogin():handleRegister())} />
              </div>
              {error && <div style={{ fontSize:"12px", color:C.red, background:C.redBg, padding:"8px 12px", borderRadius:"7px", marginBottom:"10px" }}>{error}</div>}
              <button onClick={mode==="login"?handleLogin:handleRegister} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:loading?C.tide:C.cta, color:loading?C.muted:C.ctaText, fontWeight:700, fontSize:"14px", cursor:loading?"not-allowed":"pointer", fontFamily:"'Nunito',sans-serif", transition:"all .15s" }}>
                {loading ? "Please wait…" : mode==="login" ? "Sign In" : "Create Account"}
              </button>
              {mode === "login" && (
                <div style={{ textAlign:"center", marginTop:"10px" }}>
                  <button onClick={() => { setMode("forgot"); setError(""); }} style={{ background:"none", border:"none", color:C.muted, fontWeight:600, cursor:"pointer", fontSize:"12px" }}>Forgot your password?</button>
                </div>
              )}
              <div style={{ textAlign:"center", marginTop:"10px", fontSize:"12px", color:C.muted }}>
                {mode==="login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none", border:"none", color:C.amber, fontWeight:700, cursor:"pointer", fontSize:"12px" }}>
                  {mode==="login" ? "Create one" : "Sign in"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ authorName, allTrips, onClose, onTripClick, currentUser, onEditTrip, onDeleteTrip }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const contributorTrips = allTrips.filter(t =>
    (t.author || "").toLowerCase() === authorName.toLowerCase()
  );

  const isOwnProfile = currentUser && contributorTrips.some(t => t.userId === currentUser.id);

  useEffect(() => {
    supabase.from("profiles").select("*")
      .ilike("display_name", authorName)
      .single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [authorName]);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month:"long", year:"numeric" })
    : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.7)", zIndex:2000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"880px", overflow:"hidden", boxShadow:`0 32px 64px rgba(28,43,58,0.2)`, border:`1px solid ${C.tide}` }}>

        {/* Profile header */}
        <div style={{ background:`linear-gradient(135deg,#2C1810 0%,#3D2B1F 100%)`, padding:"36px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
              {/* Avatar */}
              <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(196,168,130,0.3)", border:"2px solid rgba(196,168,130,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", fontWeight:800, color:"#FAF7F2", fontFamily:"'Playfair Display',serif", flexShrink:0 }}>
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:"24px", fontWeight:700, color:"#FAF7F2", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:"4px" }}>
                  {authorName}
                  {profile?.featured_contributor && <span style={{ marginLeft:"8px", fontSize:"13px", background:"linear-gradient(135deg,#C4A882,#A8896A)", borderRadius:"20px", padding:"2px 10px", fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>✦ Featured</span>}
                </div>
                {profile?.bio && <div style={{ fontSize:"13px", color:"rgba(250,247,242,0.8)", marginBottom:"6px", lineHeight:1.5 }}>{profile.bio}</div>}
                <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
                  <span style={{ fontSize:"12px", color:"rgba(196,168,130,0.9)" }}>🗺️ {contributorTrips.length} itinerary{contributorTrips.length!==1?"s":""}</span>
                  {memberSince && <span style={{ fontSize:"12px", color:"rgba(196,168,130,0.9)" }}>📅 Member since {memberSince}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(196,168,130,0.2)", border:"none", color:"#FAF7F2", borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px", flexShrink:0 }}>x</button>
          </div>
        </div>

        {/* Trips grid */}
        <div style={{ padding:"24px 28px" }}>
          <div style={{ fontSize:"13px", fontWeight:700, color:C.slate, marginBottom:"16px", fontFamily:"'Playfair Display',serif" }}>
            Itineraries by {authorName}
          </div>
          {contributorTrips.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px", color:C.muted }}>
              <div style={{ fontSize:"32px", marginBottom:"10px" }}>✈️</div>
              <div style={{ fontWeight:600 }}>No published trips yet</div>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"14px" }}>
              {contributorTrips.map(trip => (
                <div key={trip.id} style={{ position:"relative" }}>
                  <div onClick={() => { onTripClick(trip); onClose(); }}
                    style={{ background:C.white, border:`1px solid ${C.tide}`, borderRadius:"14px", padding:"18px", cursor:"pointer", transition:"all .2s", boxShadow:`0 1px 4px rgba(28,43,58,0.05)` }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 6px 20px rgba(28,43,58,0.1)`; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.borderColor=C.amber; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow=`0 1px 4px rgba(28,43,58,0.05)`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=C.tide; }}>
                    <div style={{ fontSize:"10px", fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" }}>{trip.region}</div>
                    <div style={{ fontSize:"15px", fontWeight:700, color:C.slate, fontFamily:"'Playfair Display',serif", marginBottom:"4px", lineHeight:1.2 }}>{trip.title}</div>
                    <div style={{ fontSize:"11px", color:C.slateLight, marginBottom:"8px" }}>{trip.destination} · {trip.duration}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"8px" }}>
                      {(trip.tags||[]).slice(0,3).map(t => <span key={t} style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"20px", background:C.seafoam, color:C.slateMid, border:`1px solid ${C.tide}` }}>{t}</span>)}
                    </div>
                    <div style={{ fontSize:"11px", color:C.slateMid, lineHeight:1.5 }}>
                      <span style={{ color:C.green, fontWeight:700 }}>❤️ </span>{(trip.loves||"").substring(0,80)}…
                    </div>
                  </div>
                  {(isOwnProfile && trip.userId === currentUser?.id) && (
                    <div style={{ position:"absolute", top:"10px", right:"10px", display:"flex", gap:"5px" }}>
                      <button onClick={e => { e.stopPropagation(); onEditTrip && onEditTrip(trip); }} style={{ padding:"4px 10px", borderRadius:"6px", border:"none", background:C.azure, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>✏️ Edit</button>
                      <button onClick={e => { e.stopPropagation(); onDeleteTrip && onDeleteTrip(trip); }} style={{ padding:"4px 10px", borderRadius:"6px", border:"none", background:C.red, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Admin Config ──────────────────────────────────────────────────────────────
// To add more admins, add their password to this array

// ── Admin Login Modal ─────────────────────────────────────────────────────────
function AdminLoginModal({ onSuccess, onClose }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const attempt = () => {
    if (ADMIN_PASSWORDS.includes(pw)) { onSuccess(); }
    else { setError(true); setTimeout(() => setError(false), 2000); setPw(""); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", padding:"40px 36px", width:"100%", maxWidth:"400px", boxShadow:`0 32px 64px rgba(44,62,80,0.25)`, border:`1px solid ${C.tide}` }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"36px", marginBottom:"12px" }}>🔐</div>
          <div style={{ fontSize:"20px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif" }}>Admin Access</div>
          <div style={{ fontSize:"12px", color:C.slateLight, marginTop:"4px" }}>TripCopycat Admin Panel</div>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Enter admin password"
          style={{ width:"100%", padding:"11px 14px", borderRadius:"10px", border:`2px solid ${error?C.red:C.tide}`, fontSize:"14px", outline:"none", boxSizing:"border-box", marginBottom:"12px", background:error?C.redBg:C.white, color:C.slate, transition:"all .2s" }}
        />
        {error && <div style={{ fontSize:"12px", color:C.red, textAlign:"center", marginBottom:"10px", fontWeight:600 }}>Incorrect password — try again</div>}
        <button onClick={attempt} style={{ width:"100%", padding:"11px", borderRadius:"10px", border:"none", background:C.cta, color:C.white, fontSize:"14px", fontWeight:700, cursor:"pointer", marginBottom:"10px" }}>
          Enter Admin Panel
        </button>
        <button onClick={onClose} style={{ width:"100%", padding:"9px", borderRadius:"10px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Admin Edit Trip Modal ─────────────────────────────────────────────────────
function AdminEditModal({ trip, onSave, onClose }) {
  const [form, setForm] = useState(JSON.parse(JSON.stringify(trip)));

  const updField = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const updRow   = (cat, i, f, v) => setForm(p => { const u = [...p[cat]]; u[i] = { ...u[i], [f]: v }; return { ...p, [cat]: u }; });
  const addRow   = cat => setForm(p => ({ ...p, [cat]: [...p[cat], { item:"", detail:"", tip:"" }] }));
  const delRow   = (cat, i) => setForm(p => ({ ...p, [cat]: p[cat].filter((_,idx) => idx !== i) }));
  const updDay   = (di, f, v) => setForm(p => { const d=[...p.days]; d[di]={...d[di],[f]:v}; return {...p,days:d}; });
  const updDayItem = (di, ii, f, v) => setForm(p => { const d=[...p.days]; const its=[...d[di].items]; its[ii]={...its[ii],[f]:v}; d[di]={...d[di],items:its}; return {...p,days:d}; });
  const addDayItem = di => setForm(p => { const d=[...p.days]; d[di]={...d[di],items:[...d[di].items,{time:"",type:"activity",label:"",note:""}]}; return {...p,days:d}; });
  const delDayItem = (di, ii) => setForm(p => { const d=[...p.days]; d[di]={...d[di],items:d[di].items.filter((_,idx)=>idx!==ii)}; return {...p,days:d}; });

  const inp  = { width:"100%", padding:"7px 10px", borderRadius:"7px", border:`1px solid ${C.tide}`, fontSize:"12px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate };
  const lbl  = { fontSize:"11px", fontWeight:600, color:C.slateMid, marginBottom:"3px", display:"block" };
  const sect = { fontSize:"13px", fontWeight:800, color:C.slate, borderBottom:`2px solid ${C.tide}`, paddingBottom:"6px", marginBottom:"14px", marginTop:"22px" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"780px", overflow:"hidden", boxShadow:`0 32px 64px rgba(44,62,80,0.25)`, border:`1px solid ${C.tide}` }}>

        {/* header */}
        <div style={{ background:C.cta, padding:"20px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Admin — Editing</div>
            <div style={{ fontSize:"18px", fontWeight:800, color:C.white, fontFamily:"'Playfair Display',Georgia,serif", marginTop:"2px" }}>{form.title}</div>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => onSave(form)} style={{ padding:"8px 20px", borderRadius:"8px", border:"none", background:C.white, color:C.azureDark, fontSize:"12px", fontWeight:800, cursor:"pointer" }}>✓ Save Changes</button>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:C.white, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"17px" }}>×</button>
          </div>
        </div>

        <div style={{ padding:"24px 28px", overflowY:"auto", maxHeight:"76vh" }}>

          {/* basics */}
          <div style={sect}>Trip Overview</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
            <div><label style={lbl}>Title</label><input style={inp} value={form.title} onChange={e=>updField("title",e.target.value)} /></div>
            <div><label style={lbl}>Destination</label><input style={inp} value={form.destination} onChange={e=>updField("destination",e.target.value)} /></div>
            <div><label style={lbl}>Region</label><select style={inp} value={form.region} onChange={e=>updField("region",e.target.value)}>{REGIONS.filter(r=>r!=="All Regions").map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label style={lbl}>Duration</label><input style={inp} value={form.duration} onChange={e=>updField("duration",e.target.value)} /></div>
            <div><label style={lbl}>Date</label><input style={inp} value={form.date} onChange={e=>updField("date",e.target.value)} /></div>
            <div><label style={lbl}>Travelers</label><input style={inp} value={form.travelers} onChange={e=>updField("travelers",e.target.value)} /></div>
            <div><label style={lbl}>Author</label><input style={inp} value={form.author} onChange={e=>updField("author",e.target.value)} /></div>
            <div style={{ gridColumn:"1/-1" }}><label style={lbl}>🖼️ Cover Image URL <span style={{ fontWeight:400, color:C.muted }}>(e.g. /victoria-street.jpg or full https:// URL — leave blank for gradient)</span></label><input style={inp} value={form.image||""} onChange={e=>updField("image",e.target.value)} placeholder="/your-photo.jpg or https://..." /></div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.featured||false} onChange={e=>updField("featured",e.target.checked)} style={{ width:"16px", height:"16px", accentColor:C.amber }} />
                <span style={{ fontSize:"12px", fontWeight:700, color:C.amber }}>✦ Mark as Featured Itinerary</span>
                <span style={{ fontSize:"11px", color:C.muted }}>(appears in Featured section at top of page)</span>
              </label>
            </div>
          </div>
          {form.image && (
            <div style={{ marginBottom:"14px" }}>
              <img src={form.image} alt="Cover preview" style={{ width:"100%", height:"140px", objectFit:"cover", borderRadius:"10px", border:`1px solid ${C.tide}` }} onError={e=>e.target.style.display="none"} />
            </div>
          )}
          <div style={{ marginBottom:"12px" }}>
            <label style={{...lbl,color:C.green}}>❤️ What They Loved</label>
            <textarea style={{...inp,height:"80px",resize:"vertical"}} value={form.loves} onChange={e=>updField("loves",e.target.value)} />
          </div>
          <div>
            <label style={{...lbl,color:C.amber}}>🔄 Do Differently</label>
            <textarea style={{...inp,height:"80px",resize:"vertical"}} value={form.doNext} onChange={e=>updField("doNext",e.target.value)} />
          </div>

          {/* categories */}
          {Object.entries(catConfig).map(([key,cfg]) => (
            <div key={key}>
              <div style={sect}>{cfg.label}</div>
              {form[key]?.map((row,i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:"6px", marginBottom:"7px", alignItems:"center" }}>
                  <input style={inp} placeholder="Name" value={row.item} onChange={e=>updRow(key,i,"item",e.target.value)} />
                  <input style={inp} placeholder="Details" value={row.detail} onChange={e=>updRow(key,i,"detail",e.target.value)} />
                  <input style={inp} placeholder="Tip" value={row.tip} onChange={e=>updRow(key,i,"tip",e.target.value)} />
                  <button onClick={()=>delRow(key,i)} style={{ padding:"6px 10px", borderRadius:"6px", border:`1px solid ${C.red}`, background:C.redBg, color:C.red, cursor:"pointer", fontSize:"13px", fontWeight:700, flexShrink:0 }}>✕</button>
                </div>
              ))}
              <button onClick={()=>addRow(key)} style={{ fontSize:"11px", color:cfg.color, background:"none", border:`1px dashed ${cfg.color}`, padding:"3px 10px", borderRadius:"5px", cursor:"pointer", fontWeight:600 }}>+ Add row</button>
            </div>
          ))}

          {/* daily itinerary */}
          <div style={sect}>📅 Daily Itinerary</div>
          {form.days?.map((day, di) => (
            <div key={di} style={{ background:C.seafoam, borderRadius:"12px", padding:"14px 16px", marginBottom:"14px", border:`1px solid ${C.tide}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:"8px", marginBottom:"12px", alignItems:"center" }}>
                <div style={{ fontSize:"12px", fontWeight:800, color:C.azure, minWidth:"40px" }}>Day {day.day}</div>
                <input style={inp} placeholder="Date (e.g. Mar 12)" value={day.date} onChange={e=>updDay(di,"date",e.target.value)} />
                <input style={inp} placeholder="Day title" value={day.title} onChange={e=>updDay(di,"title",e.target.value)} />
              </div>
              {day.items.map((item, ii) => (
                <div key={ii} style={{ display:"grid", gridTemplateColumns:"80px 90px 1fr 1fr auto", gap:"5px", marginBottom:"6px", alignItems:"center" }}>
                  <input style={{...inp,fontSize:"11px"}} placeholder="Time" value={item.time} onChange={e=>updDayItem(di,ii,"time",e.target.value)} />
                  <select style={{...inp,fontSize:"11px"}} value={item.type} onChange={e=>updDayItem(di,ii,"type",e.target.value)}>
                    {["hotel","restaurant","bar","activity","transport"].map(t=><option key={t}>{t}</option>)}
                  </select>
                  <input style={{...inp,fontSize:"11px"}} placeholder="Label" value={item.label} onChange={e=>updDayItem(di,ii,"label",e.target.value)} />
                  <input style={{...inp,fontSize:"11px"}} placeholder="Note" value={item.note} onChange={e=>updDayItem(di,ii,"note",e.target.value)} />
                  <button onClick={()=>delDayItem(di,ii)} style={{ padding:"5px 8px", borderRadius:"5px", border:`1px solid ${C.red}`, background:C.redBg, color:C.red, cursor:"pointer", fontSize:"11px" }}>✕</button>
                </div>
              ))}
              <button onClick={()=>addDayItem(di)} style={{ fontSize:"11px", color:C.azureDeep, background:"none", border:`1px dashed ${C.azure}`, padding:"3px 10px", borderRadius:"5px", cursor:"pointer", fontWeight:600 }}>+ Add item</button>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ padding:"16px 28px", borderTop:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"space-between" }}>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Cancel</button>
          <button onClick={() => onSave(form)} style={{ padding:"9px 24px", borderRadius:"8px", border:"none", background:C.cta, color:C.ctaText, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>✓ Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Modal ────────────────────────────────────────────────────────────

function FeedbackModal({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const inp = { width:"100%", padding:"9px 12px", borderRadius:"8px", border:`1px solid ${C.tide}`, fontSize:"13px", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:C.white, color:C.slate };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("https://formsubmit.co/ajax/andrew@tripcopycat.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: name || "Anonymous", email: email || "No email provided", message, _subject: "TripCopycat Beta Feedback" })
      });
    } catch(e) {}
    setSending(false);
    setSent(true);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:6000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px", backdropFilter:"blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"480px", boxShadow:`0 32px 64px rgba(44,62,80,0.25)`, overflow:"hidden", border:`1px solid ${C.tide}` }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg, #1C2B3A 0%, #C1692A 100%)`, padding:"22px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"3px" }}>Beta Feedback</div>
            <div style={{ fontSize:"19px", fontWeight:700, color:C.white, fontFamily:"'Playfair Display',Georgia,serif" }}>Share Your Thoughts</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:C.white, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"18px" }}>×</button>
        </div>

        {sent ? (
          <div style={{ padding:"48px 28px", textAlign:"center" }}>
            <div style={{ fontSize:"44px", marginBottom:"14px" }}>🙏</div>
            <div style={{ fontSize:"18px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif", marginBottom:"8px" }}>Thank you!</div>
            <div style={{ fontSize:"13px", color:C.slateLight, lineHeight:1.6, marginBottom:"24px" }}>Your feedback helps us build a better TripCopycat. We read every message.</div>
            <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:"10px", border:"none", background:C.cta, color:C.ctaText, fontWeight:700, fontSize:"13px", cursor:"pointer" }}>Close</button>
          </div>
        ) : (
          <div style={{ padding:"24px 28px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
              <div>
                <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, display:"block", marginBottom:"4px" }}>Name <span style={{ color:C.muted, fontWeight:400 }}>(optional)</span></label>
                <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, display:"block", marginBottom:"4px" }}>Email <span style={{ color:C.muted, fontWeight:400 }}>(optional)</span></label>
                <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ fontSize:"11px", fontWeight:600, color:C.slateMid, display:"block", marginBottom:"4px" }}>Feedback <span style={{ color:C.red }}>*</span></label>
              <textarea style={{...inp, height:"110px", resize:"vertical"}} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us about a bug, a suggestion, or anything on your mind…" />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button onClick={onClose} style={{ padding:"9px 18px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleSend} disabled={!message.trim() || sending} style={{ padding:"9px 24px", borderRadius:"8px", border:"none", background:message.trim()?C.cta:C.tide, color:message.trim()?C.ctaText:C.muted, fontSize:"12px", fontWeight:700, cursor:message.trim()?"pointer":"not-allowed", transition:"all .15s" }}>
                {sending ? "Sending…" : "Send Feedback →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Legal Modal ───────────────────────────────────────────────────────────────

function LegalModal({ onClose }) {
  const sect = { fontSize:"15px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',Georgia,serif", marginTop:"28px", marginBottom:"8px" };
  const sub  = { fontSize:"13px", fontWeight:700, color:C.slateLight, marginTop:"14px", marginBottom:"4px" };
  const body = { fontSize:"13px", color:C.slateMid, lineHeight:1.75, margin:"0 0 8px 0" };
  const bullet = { fontSize:"13px", color:C.slateMid, lineHeight:1.75, margin:"4px 0 4px 16px" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:5000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px", overflowY:"auto", backdropFilter:"blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:C.white, borderRadius:"20px", width:"100%", maxWidth:"720px", boxShadow:`0 32px 64px rgba(44,62,80,0.25)`, overflow:"hidden", border:`1px solid ${C.tide}` }}>

        {/* Header */}
        <div style={{ background:C.slate, padding:"24px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(196,168,130,0.8)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"4px" }}>Legal</div>
            <div style={{ fontSize:"20px", fontWeight:700, color:C.white, fontFamily:"'Playfair Display',Georgia,serif" }}>Terms of Service &amp; Legal Notices</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:C.white, borderRadius:"50%", width:"34px", height:"34px", cursor:"pointer", fontSize:"18px" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding:"28px 32px 40px", overflowY:"auto", maxHeight:"72vh" }}>
          <p style={{ ...body, color:C.muted, fontSize:"12px" }}>Last updated: {new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</p>

          <div style={sect}>1. Ownership of TripCopycat Brand and Assets</div>
          <p style={body}>The Service and its original content, features, and functionality—including but not limited to the TripCopycat name, the "Cat" logo, website design, text, graphics, and underlying code—are and will remain the exclusive property of TripCopycat and its licensors.</p>
          <p style={sub}>Trademarks</p>
          <p style={body}>The name "TripCopycat," the cat logo, and all related names, logos, product and service names, designs, and slogans are trademarks of TripCopycat. You must not use such marks without prior written permission.</p>
          <p style={sub}>Trade Dress</p>
          <p style={body}>The "look and feel" of the TripCopycat platform, including its unique color combinations, button shapes, and layout, is protected trade dress.</p>
          <p style={sub}>Copyright</p>
          <p style={body}>The site and its contents are protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

          <div style={sect}>2. User Content Submission License</div>
          <p style={body}>By submitting a trip itinerary, photos, or descriptions (the "Content") to TripCopycat, you agree to the following:</p>
          <p style={sub}>Ownership &amp; License</p>
          <p style={body}>You retain ownership of your original Content. However, by submitting it, you grant TripCopycat a worldwide, royalty-free, perpetual, and non-exclusive license to host, store, use, display, reproduce, modify, and distribute your Content on our website, social media, and in marketing materials.</p>
          <p style={sub}>The "Copycat" Right</p>
          <p style={body}>You understand and agree that the purpose of TripCopycat is to allow other users to view, download, and "copycat" your itinerary for their own personal travel use. You grant TripCopycat the right to format your data into downloadable or interactive formats for our community.</p>
          <p style={sub}>Your Representation</p>
          <p style={body}>You represent and warrant that you are the original creator of the Content or have the legal right to share it, and that the Content does not violate the intellectual property or privacy rights of any third party.</p>
          <p style={sub}>No Compensation</p>
          <p style={body}>You understand that you will not receive financial compensation for submitting Content to TripCopycat, unless otherwise agreed upon in a separate written agreement.</p>

          <div style={sect}>3. Copyright Infringement (DMCA)</div>
          <p style={body}>We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on the Service infringes on the copyright or other intellectual property rights of any person or entity. If you believe your work has been copied in a way that constitutes copyright infringement, please contact us with a description of the allegedly infringing material and your contact information.</p>

          <div style={{ marginTop:"32px", padding:"16px 20px", background:C.seafoam, borderRadius:"12px", border:`1px solid ${C.tide}` }}>
            <p style={{ ...body, margin:0, fontSize:"12px", color:C.muted }}>Questions about these terms? Contact us at <strong style={{ color:C.slate }}>legal@tripcopycat.com</strong></p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 32px", borderTop:`1px solid ${C.tide}`, background:C.seafoam, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"9px 24px", borderRadius:"8px", border:"none", background:C.cta, color:C.ctaText, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [trips, setTrips] = useState([]);
  const [dbTrips, setDbTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [photoImportData, setPhotoImportData] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Force login before submitting
  const openSubmit = () => {
    if (!currentUser) { setPendingSubmit(true); setShowAuth(true); }
    else setShowSubmit(true);
  };
  const [showQueue, setShowQueue] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [tag, setTag] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [duration, setDuration] = useState("Any Length");
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const isMobile = () => window.innerWidth < 640;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  useEffect(() => {
    const onResize = () => { if (isMobile()) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Load from Supabase on mount
  // Expose profile setter for card author clicks
  useEffect(() => { window.__setViewingProfile = setViewingProfile; }, []);


  const fetchTrips = () => {
    setTripsLoading(true);
    supabase.from("trips").select("*").eq("status","published").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Supabase fetch error:", error);
        if (data?.length > 0) {
          const mapped = data.map(t => ({
            id:t.id, title:t.title, destination:t.destination, region:t.region,
            author:t.author_name, date:t.date, duration:t.duration, travelers:t.travelers,
            tags:t.tags||[], loves:t.loves, doNext:t.do_next,
            airfare:t.airfare||[], hotels:t.hotels||[], restaurants:t.restaurants||[],
            bars:t.bars||[], activities:t.activities||[], days:t.days||[],
            image:t.image||"", userId:t.user_id||null, featured:t.featured||false
          }));
          setDbTrips(mapped);
        }
        setTripsLoading(false);
      });
  };

  useEffect(() => { fetchTrips(); }, []);

  const openTrip = (trip) => { setSelected(trip); window.history.pushState(null, "", `#trip/${trip.id}`); };
  const closeTrip = () => { setSelected(null); window.history.pushState(null, "", window.location.pathname); };

  const allTrips = [...dbTrips, ...trips];

  // URL hash routing for individual trips
  useEffect(() => {
    window.__openTrip = (trip) => setSelected(trip);
    const handleHash = () => {
      const hash = window.location.hash;
      const m = hash.match(/#trip\/(.+)/);
      if (m && allTrips.length > 0) {
        const found = allTrips.find(t => t.id === m[1] || slugify(t.title) === m[1]);
        if (found) setSelected(found);
      }
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, [allTrips]);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDisplayName, setCurrentDisplayName] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Detect Supabase password reset redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setShowResetPassword(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
          .then(({ data }) => {
            setCurrentUser(session.user);
            setCurrentDisplayName(data?.display_name || session.user.email);
          });
      }
    });
  }, []);

  const handleAuthSuccess = ({ user, displayName }) => {
    setCurrentUser(user);
    setCurrentDisplayName(displayName);
    setShowAuth(false);
    if (pendingSubmit) { setPendingSubmit(false); setShowSubmit(true); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentDisplayName("");
    setViewingProfile(null);
  };

  // Admin state
  const isAdminUrl = window.location.pathname === "/admin" || window.location.hash === "#admin";
  const [showAdminLogin, setShowAdminLogin] = useState(isAdminUrl);
  const [isAdmin, setIsAdmin] = useState(false);
  const handleAdminLogin = () => { setIsAdmin(true); setShowAdminLogin(false); };
  const [showLegal, setShowLegal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showMoreTags, setShowMoreTags] = useState(false);
  useEffect(() => { window.__setShowLegal = setShowLegal; }, []);
  const [editingTrip, setEditingTrip] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSaveTrip = async (updated) => {
    if (!isAdmin) {
      const result = runContentFilter(updated);
      if (!result.passed) {
        alert("Your edit contains flagged content and could not be saved: " + result.flags.join(", "));
        return;
      }
    }
    await supabase.from("trips").update({
      title: updated.title, destination: updated.destination, region: updated.region,
      author_name: updated.author,
      date: updated.date, duration: updated.duration, travelers: updated.travelers,
      tags: updated.tags, loves: updated.loves, do_next: updated.doNext,
      airfare: updated.airfare, hotels: updated.hotels, restaurants: updated.restaurants,
      bars: updated.bars, activities: updated.activities, days: updated.days,
      image: updated.image || "", featured: updated.featured || false
    }).eq("id", updated.id);
    setTrips(p => p.map(t => t.id === updated.id ? updated : t));
    setDbTrips(p => p.map(t => t.id === updated.id ? updated : t));
    setEditingTrip(null);
  };
  const handleDeleteTrip = async (id) => {
    await supabase.from("trips").delete().eq("id", id);
    setTrips(p => p.filter(t => t.id !== id));
    setDbTrips(p => p.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  const filtered = useMemo(() => {
    const f = allTrips.filter(t =>
      (!search || [t.title,t.destination,t.travelers,t.loves].some(s=>s.toLowerCase().includes(search.toLowerCase()))) &&
      (region==="All Regions"||t.region===region) &&
      (tag==="All"||tag==="__bookmarks__"?true:t.tags.includes(tag)) &&
      (tag!=="__bookmarks__"||bookmarks.includes(t.id)) &&
      matchesDuration(t, duration)
    );
    if (sortBy === "submitter") f.sort((a,b) => a.author.localeCompare(b.author));
    else if (sortBy === "destination") f.sort((a,b) => a.destination.localeCompare(b.destination));
    else if (sortBy === "duration") f.sort((a,b) => parseInt(a.duration)||0 - (parseInt(b.duration)||0));
    return f;
  }, [dbTrips, trips, search, region, tag, sortBy, duration, bookmarks]);

  return (
    <div style={{ minHeight:"100vh", background:C.seafoam, fontFamily:"'Nunito',system-ui,sans-serif", overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Admin banner */}
      {isAdmin && (
        <div style={{ background:`linear-gradient(90deg,${C.slate},${C.slateLight})`, padding:"8px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:"12px", fontWeight:700, color:C.white, display:"flex", alignItems:"center", gap:"8px" }}>
            <span>🔐</span> Admin Mode Active — you can edit, delete and add trips
          </div>
          <button onClick={() => setIsAdmin(false)} style={{ fontSize:"11px", fontWeight:700, color:C.white, background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"6px", padding:"4px 12px", cursor:"pointer" }}>Exit Admin</button>
        </div>
      )}

      {/* Beta banner */}
      <div style={{ background:`linear-gradient(135deg, #1C2B3A 0%, #2E4A3E 60%, #C1692A 100%)`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, minWidth:0 }}>
          <span style={{ fontSize:"16px", flexShrink:0 }}>🐾</span>
          <p style={{ margin:0, fontSize:"12px", color:"rgba(255,255,255,0.92)", lineHeight:1.5 }}>
            <strong style={{ color:C.cta }}>Welcome to the TripCopycat Beta!</strong> We're currently building the world's first travel blueprint library. If you find a bug or have a suggestion, we'd love your feedback as we grow.
          </p>
        </div>
        <button onClick={() => setShowFeedback(true)} style={{ flexShrink:0, padding:"7px 16px", borderRadius:"20px", border:"1px solid rgba(196,168,130,0.6)", background:"rgba(196,168,130,0.15)", color:C.cta, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(196,168,130,0.3)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(196,168,130,0.15)"}}>
          Provide Feedback →
        </button>
      </div>

      {/* Nav */}
      <nav style={{ background:C.white, borderBottom:`1px solid ${C.tide}`, padding:"0", margin:"0", position:"sticky", top:0, zIndex:100, boxShadow:`0 1px 6px rgba(28,43,58,0.06)` }}>
        <div style={{ width:"100%", padding:"0 16px", boxSizing:"border-box", display:"flex", alignItems:"center", justifyContent:"space-between", height:"58px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <img src="/copycat.svg" alt="TripCopycat" style={{ height:"44px", width:"44px", objectFit:"contain", background:"transparent", display:"block", mixBlendMode:"multiply" }} />
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, fontSize:"22px", color:C.slate, letterSpacing:"-0.01em" }}>TripCopycat<sup style={{ fontSize:"10px", fontWeight:700, verticalAlign:"super", letterSpacing:0 }}>™</sup></span>
            <span style={{ fontSize:"9px", background:C.seafoamDeep, color:C.azureDeep, fontWeight:700, padding:"2px 7px", borderRadius:"20px", border:`1px solid ${C.tide}` }}>beta</span>
          </div>
          <div style={{ display:"flex", gap:"7px" }}>
            {!isAdmin && <button onClick={() => openSubmit()} style={{ background:C.cta, color:C.ctaText, border:"none", borderRadius:"8px", padding:"7px 16px", fontSize:"12px", fontWeight:700, cursor:"pointer", boxShadow:`0 3px 12px rgba(196,168,130,0.4)` }}>+ Submit a Trip</button>}
            {isAdmin && <button onClick={() => setShowQueue(true)} style={{ background:C.amberBg, color:C.amber, border:`1px solid ${C.amber}44`, borderRadius:"8px", padding:"7px 14px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>📋 Queue</button>}
            {isAdmin && <button onClick={() => setShowImport(true)} style={{ background:C.seafoam, color:C.slateMid, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"7px 14px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>🤖 Smart Import</button>}
            {isAdmin && <button onClick={() => setShowAdd(true)} style={{ background:C.cta, color:C.ctaText, border:"none", borderRadius:"8px", padding:"7px 16px", fontSize:"12px", fontWeight:700, cursor:"pointer", boxShadow:`0 3px 12px rgba(196,168,130,0.4)` }}>+ Add Trip</button>}
            {!isAdmin && !currentUser && <button onClick={() => setShowAuth(true)} style={{ background:C.seafoam, color:C.slateMid, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"7px 14px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>Sign In</button>}
            {!isAdmin && currentUser && (
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <button onClick={() => setViewingProfile(currentDisplayName)} style={{ background:C.seafoam, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"6px 12px", fontSize:"12px", fontWeight:600, color:C.slate, cursor:"pointer", display:"flex", alignItems:"center", gap:"6px" }}>
                  <span style={{ width:"22px", height:"22px", borderRadius:"50%", background:C.cta, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:800, color:C.ctaText }}>{currentDisplayName.charAt(0).toUpperCase()}</span>
                  {currentDisplayName}
                </button>
                <button onClick={handleSignOut} style={{ background:"none", border:"none", color:C.muted, fontSize:"11px", cursor:"pointer", padding:"4px" }}>Sign out</button>
              </div>
            )}
            {!isAdmin && <button onClick={() => setShowAdminLogin(true)} style={{ background:C.seafoam, color:C.muted, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"7px 12px", fontSize:"11px", fontWeight:600, cursor:"pointer", opacity:0.3 }}>🔐</button>}
          </div>
        </div>
      </nav>

      {/* Hero — Warm Nomad */}
      <div style={{ background:C.seafoam, padding:"40px 0 36px", margin:"0", textAlign:"center", position:"relative", overflow:"hidden", borderBottom:`1px solid ${C.tide}` }}>
        {/* subtle texture overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 50%, rgba(196,168,130,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(193,105,42,0.06) 0%, transparent 50%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>

          <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(36px,6vw,62px)", fontWeight:700, color:C.slate, margin:"0 0 20px", lineHeight:1.1, letterSpacing:"-0.01em" }}>
            Planned by others.<br/>Perfected by you.
          </h1>
          <p style={{ fontSize:"clamp(14px,2vw,17px)", color:C.slateLight, margin:"0 0 32px", maxWidth:"580px", marginLeft:"auto", marginRight:"auto", fontWeight:400, lineHeight:1.75 }}>
            The ultimate cheat code for your next vacation. We crowd-source highly detailed, recreatable trip itineraries so you don't have to reinvent the wheel. Steal the logistics, duplicate the route, or customize and make it your own — spend your time looking forward to the destination.
          </p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", alignItems:"center", flexWrap:"wrap", marginBottom:"36px" }}>
            <button onClick={() => { const el = document.getElementById("trip-grid"); if(el) el.scrollIntoView({ behavior:"smooth" }); }} style={{ background:C.cta, color:C.ctaText, border:"none", borderRadius:"50px", padding:"14px 32px", fontSize:"14px", fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", letterSpacing:"0.02em", boxShadow:`0 4px 18px rgba(196,168,130,0.45)` }}>
              Leverage a Copycat
            </button>
            <button onClick={() => openSubmit()} style={{ background:"transparent", color:C.slateLight, border:`1.5px solid ${C.tide}`, borderRadius:"50px", padding:"14px 28px", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
              Submit a Trip →
            </button>
          </div>
          <div style={{ maxWidth:"520px", margin:"0 auto", position:"relative" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search destinations, trips, activities…" style={{ width:"100%", padding:"16px 22px 16px 52px", borderRadius:"50px", border:`2px solid ${C.tide}`, fontSize:"15px", outline:"none", boxSizing:"border-box", background:C.white, color:C.slate, boxShadow:`0 4px 20px rgba(28,43,58,0.08)`, fontFamily:"'Nunito',sans-serif" }} />
            <span style={{ position:"absolute", left:"18px", top:"50%", transform:"translateY(-50%)", fontSize:"16px" }}>🔍</span>
          </div>
        </div>
      </div>

      {/* Main layout — sidebar + grid */}
      <div style={{ maxWidth:"100%", padding:"20px 16px", display:"flex", gap:"24px", alignItems:"flex-start", boxSizing:"border-box" }}>

        {/* Left Sidebar */}
        {sidebarOpen && (
          <aside style={{ width:"220px", flexShrink:0, position:"sticky", top:"68px" }}>
            {/* Collapse button */}
            <button onClick={() => setSidebarOpen(false)} style={{ width:"100%", padding:"7px 12px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.muted, fontSize:"11px", fontWeight:600, cursor:"pointer", marginBottom:"14px", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>Hide sidebar</span><span>←</span>
            </button>

            {/* Trip type filter */}
            <div style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, padding:"14px 16px", marginBottom:"14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Trip Type</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {(showMoreTags ? TAGS : PRIMARY_TAGS).map(t => (
                  <button key={t} onClick={() => setTag(t)} style={{ padding:"3px 9px", borderRadius:"20px", border:`1px solid ${tag===t?C.slate:C.tide}`, background:tag===t?C.slate:C.white, color:tag===t?C.white:C.slateLight, fontSize:"10px", fontWeight:600, cursor:"pointer", transition:"all .12s" }}>{t}</button>
                ))}
              </div>
              <button onClick={() => setShowMoreTags(p=>!p)} style={{ marginTop:"8px", fontSize:"10px", fontWeight:700, color:C.amber, background:"none", border:"none", cursor:"pointer", padding:"2px 0" }}>
                {showMoreTags ? "▲ Show less" : `▼ More types (${EXTENDED_TAGS.length})`}
              </button>
            </div>

            {/* Region filter */}
            <div style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, padding:"14px 16px", marginBottom:"14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Region</div>
              {REGIONS.map(r => (
                <button key={r} onClick={() => setRegion(r)} style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 10px", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:region===r?700:400, background:region===r?C.sandDeep:"transparent", color:region===r?C.slate:C.slateLight, marginBottom:"2px", transition:"all .12s" }}>
                  {region===r && <span style={{ color:C.amber, marginRight:"5px" }}>▸</span>}{r}
                </button>
              ))}
            </div>

            {/* Duration filter */}
            <div style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, padding:"14px 16px", marginBottom:"14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Trip Length</div>
              {DURATION_FILTERS.map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 10px", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:duration===d?700:400, background:duration===d?C.sandDeep:"transparent", color:duration===d?C.slate:C.slateLight, marginBottom:"2px", transition:"all .12s" }}>
                  {duration===d && <span style={{ color:C.amber, marginRight:"5px" }}>▸</span>}{d}
                </button>
              ))}
            </div>

            {/* Top contributors */}
            <div style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, padding:"14px 16px", marginBottom:"14px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Top Contributors</div>
              {[...allTrips.reduce((acc, t) => { acc.set(t.author, (acc.get(t.author)||0)+1); return acc; }, new Map())].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([author, count]) => (
                <div key={author} onClick={() => setViewingProfile(author)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", cursor:"pointer", borderBottom:`1px solid ${C.seafoamDeep}` }}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                    <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:C.cta, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:800, color:C.ctaText, flexShrink:0 }}>{author.charAt(0).toUpperCase()}</div>
                    <span style={{ fontSize:"12px", color:C.amber, fontWeight:600 }}>{author}</span>
                  </div>
                  <span style={{ fontSize:"10px", color:C.muted }}>{count} trip{count!==1?"s":""}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ background:C.white, borderRadius:"12px", border:`1px solid ${C.tide}`, padding:"14px 16px", boxShadow:`0 1px 4px rgba(44,62,80,0.05)` }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Platform</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                <span style={{ fontSize:"12px", color:C.slateLight }}>Itineraries</span>
                <strong style={{ fontSize:"12px", color:C.slate }}>{allTrips.length}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"14px" }}>
                <span style={{ fontSize:"12px", color:C.slateLight }}>Contributors</span>
                <strong style={{ fontSize:"12px", color:C.slate }}>{[...new Set(allTrips.map(t=>t.author))].length}</strong>
              </div>
              <button onClick={() => openSubmit()} style={{ width:"100%", padding:"9px", borderRadius:"8px", border:"none", background:C.cta, color:C.ctaText, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>+ Submit a Trip</button>
            </div>
          </aside>
        )}

        {/* Expand sidebar button when collapsed */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{ position:"fixed", left:"16px", top:"50%", transform:"translateY(-50%)", zIndex:50, background:C.white, border:`1px solid ${C.tide}`, borderRadius:"8px", padding:"8px 6px", cursor:"pointer", fontSize:"11px", color:C.muted, boxShadow:`0 2px 8px rgba(44,62,80,0.1)`, writingMode:"vertical-rl" }}>
            Filters →
          </button>
        )}

        {/* Main content */}
        <main id="trip-grid" style={{ flex:1, minWidth:0 }}>
          {/* Bookmarks bar */}
          {bookmarks.length > 0 && (
            <div style={{ marginBottom:"12px", display:"flex", alignItems:"center", gap:"8px" }}>
              <button onClick={() => setTag("__bookmarks__")} style={{ padding:"4px 12px", borderRadius:"20px", border:`1px solid ${tag==="__bookmarks__"?C.amber:C.tide}`, background:tag==="__bookmarks__"?C.amberBg:C.white, color:tag==="__bookmarks__"?C.amber:C.slateLight, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>
                🔖 My Saved Trips ({bookmarks.length})
              </button>
              {tag==="__bookmarks__" && <button onClick={() => setTag("All")} style={{ fontSize:"11px", color:C.muted, background:"none", border:"none", cursor:"pointer" }}>× Clear</button>}
            </div>
          )}

          {/* Featured section — only show when no active filters */}
          {!search && region==="All Regions" && tag==="All" && duration==="Any Length" && sortBy==="default" && (() => {
            const featuredTrips = allTrips.filter(t => t.featured);
            if (!featuredTrips.length) return null;
            return (
              <div style={{ marginBottom:"32px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                  <span style={{ fontSize:"16px" }}>✦</span>
                  <div style={{ fontSize:"13px", fontWeight:800, color:C.slate, fontFamily:"'Playfair Display',serif", letterSpacing:"0.02em" }}>Featured Itineraries</div>
                  <div style={{ flex:1, height:"1px", background:C.tide }} />
                  <span style={{ fontSize:"10px", color:C.muted, fontWeight:600 }}>Editor's Picks</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(300px,100%),1fr))", gap:"18px" }}>
                  {featuredTrips.map(trip => (
                    <div key={trip.id} style={{ position:"relative" }}>
                      <TripCard trip={trip} onClick={openTrip} isBookmarked={bookmarks.includes(trip.id)} onBookmark={toggleBookmark} />
                      {isAdmin && (
                        <div style={{ position:"absolute", top:"12px", right:"12px", display:"flex", gap:"6px", zIndex:10 }}>
                          <button onClick={e => { e.stopPropagation(); setEditingTrip(trip); }} style={{ padding:"5px 10px", borderRadius:"7px", border:"none", background:C.azure, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>✏️</button>
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(trip); }} style={{ padding:"5px 10px", borderRadius:"7px", border:"none", background:C.red, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* All itineraries */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px", flexWrap:"wrap" }}>
            <div style={{ fontSize:"12px", color:C.muted }}>
              <strong style={{ color:C.slate }}>{filtered.length}</strong> itinerar{filtered.length!==1?"ies":"y"}{search&&<> for "<strong style={{ color:C.slate }}>{search}</strong>"</>}
            </div>
            <div style={{ flex:1 }} />
            {(region !== "All Regions" || tag !== "All" || duration !== "Any Length") && (
              <button onClick={() => { setRegion("All Regions"); setTag("All"); setDuration("Any Length"); }} style={{ fontSize:"11px", color:C.amber, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Clear filters ×</button>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
              <span style={{ fontSize:"11px", color:C.muted }}>Sort:</span>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ fontSize:"11px", fontWeight:600, color:C.slate, border:`1px solid ${C.tide}`, borderRadius:"6px", padding:"3px 7px", background:C.white, cursor:"pointer", outline:"none", fontFamily:"inherit" }}>
                <option value="default">Default</option>
                <option value="submitter">By Submitter</option>
                <option value="destination">By Destination</option>
                <option value="duration">By Duration</option>
              </select>
            </div>
          </div>

          {!search && region==="All Regions" && tag==="All" && duration==="Any Length" && sortBy==="default" && allTrips.some(t => t.featured) && (
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
              <div style={{ flex:1, height:"1px", background:C.tide }} />
              <span style={{ fontSize:"11px", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>All Itineraries</span>
              <div style={{ flex:1, height:"1px", background:C.tide }} />
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(280px,100%),1fr))", gap:"18px" }}>
            {filtered.map(trip => (
              <div key={trip.id} style={{ position:"relative" }}>
                <TripCard trip={trip} onClick={openTrip} isBookmarked={bookmarks.includes(trip.id)} onBookmark={toggleBookmark} />
                {isAdmin && (
                  <div style={{ position:"absolute", top:"12px", right:"12px", display:"flex", gap:"6px", zIndex:10 }}>
                    <button onClick={e => { e.stopPropagation(); setEditingTrip(trip); }} style={{ padding:"5px 10px", borderRadius:"7px", border:"none", background:C.azure, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>✏️</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(trip); }} style={{ padding:"5px 10px", borderRadius:"7px", border:"none", background:C.red, color:C.white, fontSize:"11px", fontWeight:700, cursor:"pointer" }}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
            {tripsLoading && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"56px 20px", color:C.muted }}>
                <div style={{ fontSize:"32px", marginBottom:"12px" }}>🐾</div>
                <div style={{ fontSize:"14px", fontWeight:600, color:C.slateLight }}>Loading itineraries…</div>
              </div>
            )}
            {!tripsLoading && filtered.length===0 && (
              <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"56px 20px", color:C.muted }}>
                <div style={{ fontSize:"38px", marginBottom:"12px" }}>✈️</div>
                <div style={{ fontSize:"15px", fontWeight:600, color:C.slateLight }}>No itineraries match your search</div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,0.75)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
          <div style={{ background:C.white, borderRadius:"16px", padding:"32px", maxWidth:"400px", width:"90%", textAlign:"center", boxShadow:`0 32px 64px rgba(44,62,80,0.25)` }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>🗑️</div>
            <div style={{ fontSize:"17px", fontWeight:800, color:C.slate, marginBottom:"8px" }}>Delete this itinerary?</div>
            <div style={{ fontSize:"13px", color:C.slateLight, marginBottom:"24px" }}>"{confirmDelete.title}" will be permanently removed.</div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex:1, padding:"10px", borderRadius:"8px", border:`1px solid ${C.tide}`, background:C.white, color:C.slateLight, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => handleDeleteTrip(confirmDelete.id)} style={{ flex:1, padding:"10px", borderRadius:"8px", border:"none", background:C.red, color:C.white, fontWeight:700, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {selected      && <TripModal trip={selected} onClose={closeTrip} allTrips={allTrips} isBookmarked={bookmarks.includes(selected.id)} onBookmark={toggleBookmark} />}
      {showAdd       && <AddTripModal onClose={() => setShowAdd(false)} onAdd={t => setTrips(p=>[t,...p])} />}
      {showImport    && <SmartImportHub onClose={() => setShowImport(false)} onPhotoComplete={(data) => { setPhotoImportData(data); setShowImport(false); openSubmit(); }} />}
      {showSubmit    && <SubmitTripModal onClose={() => { setShowSubmit(false); setPhotoImportData(null); }} currentUser={currentUser} displayName={currentDisplayName} onSubmitSuccess={fetchTrips} prefillData={photoImportData} />}
      {showAuth      && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {showResetPassword && <ResetPasswordModal onClose={() => setShowResetPassword(false)} />}
      {viewingProfile && <ProfilePage authorName={viewingProfile} allTrips={allTrips} onClose={() => setViewingProfile(null)} onTripClick={openTrip} currentUser={currentUser} onEditTrip={(trip) => setEditingTrip(trip)} onDeleteTrip={(trip) => setConfirmDelete(trip)} />}
      {showQueue     && <AdminQueueModal onClose={() => setShowQueue(false)} onApprove={fetchTrips} />}
      {showAdminLogin && <AdminLoginModal onSuccess={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />}
      {editingTrip   && <AdminEditModal trip={editingTrip} onSave={handleSaveTrip} onClose={() => setEditingTrip(null)} />}
      {showLegal     && <LegalModal onClose={() => setShowLegal(false)} />}
      {showFeedback  && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* Floating feedback button */}
      <button onClick={() => setShowFeedback(true)} style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:500, background:`linear-gradient(135deg, #1C2B3A, #C1692A)`, color:C.white, border:"none", borderRadius:"50px", padding:"11px 20px", fontSize:"12px", fontWeight:700, cursor:"pointer", boxShadow:`0 4px 18px rgba(28,43,58,0.35)`, display:"flex", alignItems:"center", gap:"7px", transition:"transform .15s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
        onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
        💬 Feedback
      </button>

      {/* Site footer */}
      <footer style={{ borderTop:`1px solid ${C.tide}`, background:C.white, padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"40px" }}>
        <span style={{ fontSize:"11px", color:C.muted }}>© {new Date().getFullYear()} TripCopycat™. All rights reserved.</span>
        <button onClick={() => setShowLegal(true)} style={{ fontSize:"11px", color:C.muted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:"inherit" }}>Terms of Service</button>
      </footer>
    </div>
  );
}
