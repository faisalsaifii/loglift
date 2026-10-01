/**
 * Hand-written form cues ("what to make sure while doing it") for the movements
 * people actually train, keyed by the catalogue's exercise name.
 *
 * The source dataset only ships auto-generated boilerplate steps, so anything not
 * listed here falls back to `getGenericSteps()` in `./exercises`. Keys must match
 * `Exercise.name` exactly.
 */
const CUES: Record<string, readonly string[]> = {
  // ── Chest ────────────────────────────────────────────────────────────────
  'Barbell Bench Press': [
    'Feet planted, glutes squeezed into the bench for a stable base.',
    'Shoulder blades retracted down and back before unracking.',
    'Bar path to the lower chest, elbows tucked at roughly 45°.',
    'Pause briefly at the bottom, then drive up and slightly inward.',
  ],
  'Dumbbell Bench Press': [
    'Press the dumbbells together over the chest to keep them balanced.',
    'Lower until the elbows are just below bench level.',
    'Wrists stacked directly over the elbows — no leaning back.',
  ],
  'Dumbbell Incline Bench Press': [
    'Bench set to 30–45° so the movement biases the upper chest.',
    'Press up and slightly towards the head, not straight up.',
    'Lower until you feel a stretch across the upper pecs.',
  ],
  'Barbell Incline Bench Press': [
    'Set the bench to 30–45°; steeper angles shift load to the shoulders.',
    'Elbows at 45–60° from the torso to keep the shoulders healthy.',
    'Touch the lower chest, then drive up and back towards the rack.',
  ],
  'Dumbbell Decline Bench Press': [
    'Lie with the pad just above the knees; hips must not sag.',
    'A neutral wrist is far safer than a 90° wrist extension.',
    'Press towards the lower chest, not straight over the face.',
  ],
  'Smith Bench Press': [
    'Set the bar just below the chest height you can control.',
    'The fixed path makes this ideal for grinding out a true limit rep.',
  ],
  'Dumbbell Fly': [
    'Soft elbows locked at a slight bend throughout — never straighten them.',
    'Open the arms in a hugging arc, not a pressing one.',
    'Squeeze the chest at the top without letting the dumbbells touch.',
  ],
  'Dumbbell Incline Fly': [
    'Keep a soft bend in the elbows and stop at shoulder height.',
    'Focus the stretch across the upper chest with the lower back flat.',
  ],
  'Cable Lying Fly': [
    'Lie down and cross the cables overhead so tension is there from rep one.',
    'Keep a soft bend in the elbows and sweep the arms out to the sides.',
    'Squeeze the chest hard at the bottom of the arc.',
  ],
  'Cable Middle Fly': [
    'Step forward into the tension before the first rep.',
    'Cross the handles slightly at the front to squeeze the chest.',
    'Keep the ribs down so the movement comes from the chest, not the spine.',
  ],
  'Hyght Dumbbell Fly': [
    'Anchor the upper back into the bench and keep the chest lifted.',
    'Move slowly — this variation is about the adductor stretch, not load.',
  ],
  'Weighted Svend Press': [
    'Press the plates straight out in front of the chest, palms forward.',
    'Squeeze the chest at full extension for a one-second hold.',
  ],
  'Chest Dip': [
    'Lean forward slightly to bias the chest, stay upright for the triceps.',
    'Lower until the elbows reach roughly 90°; do not drop below.',
    'Keep the shoulders down and away from the ears throughout.',
  ],
  'Push Up': [
    'One straight line from head to heels — no sagging hips.',
    'Squeeze the glutes and brace the midsection before the first rep.',
    'Elbows at 45–60°, chest to within a fist of the floor.',
  ],
  'Archer Push Up': [
    'Push up on one arm while the other arm stays extended as a spot.',
    'Torso rotates slightly towards the working side — that is expected.',
    'Lower the chest between the hands with full control.',
  ],

  // ── Back ─────────────────────────────────────────────────────────────────
  'Barbell Deadlift': [
    'Bar over mid-foot, shins vertical at the start of the pull.',
    'Hinge at the hips and push the chest forward — back stays flat.',
    'Knees track over the toes, then drive the floor away with the glutes.',
    'Lock out by squeezing the glutes, not by leaning back.',
  ],
  'Barbell Bent Over Row': [
    'Hinge until the torso is around 45°, brace hard, spine neutral.',
    'Pull to the lower ribs and pause with the shoulder blades squeezed.',
    'No torso heaving — if the lower back rounds, the weight is too heavy.',
  ],
  'Barbell Pendlay Row': [
    'Touch the bar to the floor between reps — no rest at the bottom.',
    'Keep the torso fixed; only the arms and shoulders should move.',
  ],
  'Barbell Incline Row': [
    'Chest against an incline bench so the upper back does the work.',
    'Row to the top of the chest with the elbows driving past the ribs.',
  ],
  'Barbell Reverse Grip Bent Over Row': [
    'Underhand grip biases the upper back and the lats.',
    'Row to the mid-chest while keeping the torso braced and still.',
  ],
  'Dumbbell Bent Over Row': [
    'Back flat, neck in line with the spine — look at the floor.',
    'Row to the hip, squeezing the shoulder blade for a beat.',
    'Let the shoulders stretch forward at the top of each rep.',
  ],
  'Dumbbell One Arm Bent Over Row': [
    'Square the hips and shoulders; resist rotating towards the bar.',
    'Pull the elbow past the hip, then lower until the lat fully stretches.',
  ],
  'Dumbbell Incline Row': [
    'Rest the chest on the bench so the upper back stays the driver.',
    'Row wide, leading with the elbows past the ribs.',
  ],
  'Cable Seated Row': [
    'Stay tall; the torso should not rock back to cheat the weight.',
    'Row to the navel and pause for a beat with the lats squeezed.',
  ],
  'Cable Straight Back Seated Row': [
    'Keep the torso completely vertical throughout the set.',
    'Row to the lower ribs and hold the squeeze for one second.',
  ],
  'Cable Low Seated Row': [
    'Angle the knees slightly to reduce hamstring tension.',
    'Pull to the abdomen with the torso still and tall.',
  ],
  'Pull Up': [
    'Start each rep from a dead hang with fully relaxed shoulders.',
    'Pull the elbows down towards the ribs, chest to the bar.',
    'Avoid swinging — a strict rep is the whole point.',
  ],
  'Chin Up': [
    'Supinated grip; pull until the chin clears the bar.',
    'Keep the ribs down so the lower back does not arch.',
  ],
  'Assisted Pull Up': [
    'Use just enough band or machine help to hit a clean 8–12 reps.',
    'Still drive the elbows down — assistance should not own the lift.',
  ],
  'Weighted Pull Up': [
    'Add load only once you can do 10 clean bodyweight reps.',
    'Avoid swinging and keep the neck neutral throughout.',
  ],
  'Cable Pulldown': [
    'Lean back only about 15° and hold that angle for every rep.',
    'Drive the elbows into the back pockets, chest tall at the bottom.',
  ],
  'Cable Lat Pulldown Full Range Of Motion': [
    'Take the bar all the way to the top of the chest, not just the upper chest.',
    'Let the shoulders elevate and depress fully at the stretch.',
  ],
  'Reverse Grip Machine Lat Pulldown': [
    'Underhand grip and a deliberate full stretch overhead.',
    'Pull the bar to the chest without letting the torso swing back.',
  ],
  'Cable Straight Arm Pulldown': [
    'Elbows locked and arms long — this isolates the lats.',
    'Hinge a little more at the hips to get the full range of motion.',
  ],
  'Cable One Arm Pulldown': [
    'Keep the hips square and resist the urge to twist.',
    'Pull the handle to the back pocket, lower until the lat fully stretches.',
  ],
  'Cable Rear Pulldown': [
    'Pull towards the collarbone, not the stomach.',
    'Exaggerate the outward rotation at the finish to catch the rear delts.',
  ],
  'Barbell Shrug': [
    'Shoulders travel straight up and down — no rolling or rotating.',
    'Hold the top position for one second at the very end of the set.',
  ],
  'Cable Shrug': [
    'Stay square to the machine and shrug straight up.',
    'Pause a beat at the top, then lower slowly all the way down.',
  ],
  'Inverted Row': [
    'Body in one straight line from heels to head.',
    'Pull the chest to the bar and squeeze the shoulder blades together.',
  ],

  // ── Shoulders ────────────────────────────────────────────────────────────
  'Barbell Standing Wide Military Press': [
    'Squeeze the glutes and brace the ribs — do not lean back.',
    'Move your head back slightly to clear a straight bar path.',
    'Lock the bar out over the mid-foot, not in front of it.',
  ],
  'Dumbbell Standing Overhead Press': [
    'Press the bells together at the top without clanging them.',
    'Ribs stay down; the lower back should barely arch.',
  ],
  'Dumbbell Seated Shoulder Press': [
    'The back support is for balance, not for leaning into the press.',
    'Stop at ear level so the shoulder stays clear of impingement.',
  ],
  'Smith Standing Military Press': [
    'The fixed path removes balance demands — perfect for heavy work.',
    'Still brace the midsection; the bar path is not a licence to arch.',
  ],
  'Barbell Front Raise': [
    'Raise to shoulder height, no higher.',
    'No swinging — a light weight and strict form beats momentum here.',
  ],
  'Dumbbell Lateral Raise': [
    'Lead with the elbows and raise to shoulder height.',
    'A slight forward lean is fine; a shrug is not.',
    'Lower slowly — the eccentric is where the delts really work.',
  ],
  'Dumbbell One Arm Lateral Raise': [
    'Support the torso with the free hand on a bench if you must lean.',
    'Raise to shoulder height and resist rotating towards the lifted arm.',
  ],
  'Cable One Arm Lateral Raise': [
    'Stand behind the cable so there is tension before the first rep.',
    'Keep the shoulder down and lead with the elbow out to the side.',
  ],
  'Cable Seated Rear Lateral Raise': [
    'Set the cable around 10–20° above horizontal.',
    'A light, strict rep beats a heavy one every time here.',
  ],
  'Dumbbell Lying Rear Lateral Raise': [
    'Hinge to 90° with a flat back and raise out to the sides.',
    'This one is for the rear delts — a light weight goes a long way.',
  ],
  'Dumbbell Rear Lateral Raise': [
    'Bend forward slightly and keep the back flat throughout.',
    'Raise out to the sides, squeezing at the top for a beat.',
  ],
  'Dumbbell Incline Raise': [
    'Lean forward around 45° for a Y-raise bias on the upper traps.',
    'Raise to the top of the chest without shrugging.',
  ],
  'Dumbbell Upright Row': [
    'Keep the elbows leading and the weights close to the body.',
    'Stop at shoulder height; higher turns it into a shrug.',
  ],
  'Dumbbell Arnold Press': [
    'Start with the palms facing you and rotate to face forward as you press.',
    'The slow rotation is the point — do not rush it.',
  ],
  'Dumbbell Cuban Press': [
    'Elbows high and forward, upper arms in line with the torso.',
    'Rotate the forearms up and back without letting the elbows drop.',
  ],
  'Dumbbell Push Press': [
    'A short shallow dip is allowed, then drive the legs and press overhead.',
    'Keep the torso vertical and the finish stacked over the mid-foot.',
  ],
  'Dumbbell Standing Alternate Overhead Press': [
    'Brace the trunk hard — single-arm pressing exposes any leaning.',
    'Finish each rep with the dumbbell stacked over the wrist.',
  ],
  'Dumbbell One Arm Shoulder Press': [
    'Sit back into the bench to kill any torso lean before the set.',
    'Press up and slightly forward, not straight up over the face.',
  ],
  'Landmine Lateral Raise': [
    'Keep a soft bend in the elbows the whole way up.',
    'Stop at shoulder height and control the descent.',
  ],

  // ── Biceps ───────────────────────────────────────────────────────────────
  'Barbell Curl': [
    'Elbows pinned to the ribs; only the forearms should move.',
    'No leaning back or swinging — if the torso moves, drop the weight.',
    'Squeeze the biceps hard at the top, lower all the way down.',
  ],
  'Ez Barbell Curl': [
    'The angled grip reduces wrist strain — use it.',
    'Keep the upper arms still and the wrists neutral throughout.',
  ],
  'Dumbbell Biceps Curl': [
    'Palms start facing forward and stay that way.',
    'Squeeze at the top and resist gravity on the way down.',
  ],
  'Dumbbell Hammer Curl': [
    'Neutral grip (thumbs up) targets the brachialis and the forearm.',
    'Keep the elbows close; this is a hinge, not a shrug.',
  ],
  'Dumbbell Incline Curl': [
    'Lay back on an incline bench with the arms behind the torso.',
    'The stretch is the point — do not let the arms drift forward.',
  ],
  'Dumbbell Concentration Curl': [
    'Elbow braced against the inner thigh, torso still.',
    'Wrist neutral and a full stretch at the bottom of each rep.',
  ],
  'Barbell Preacher Curl': [
    'Upper arms stay flat on the pad for the entire set.',
    'Extend only to a comfortable stretch — the joint does not like forced range.',
  ],
  'Dumbbell Preacher Curl': [
    'Keep the back of the upper arms planted on the pad.',
    'Squeeze at the top, then lower for a slow two-second count.',
  ],
  'Dumbbell Bicep Curl On Exercise Ball With Leg Raised': [
    'The core stays braced while one leg is lifted — very little margin for error.',
    'Only the arm should move; the torso is a fixed platform.',
  ],
  'Cable Curl': [
    'Stand upright in front of the stack with the arms behind the line of the torso.',
    'Keep tension on the cable at the bottom of every rep.',
  ],
  'Cable Hammer Curl With Rope': [
    'Split the rope ends and keep the thumbs up.',
    'Keep the elbows pinned and resist the cable pulling you forward.',
  ],
  'Cable One Arm Curl': [
    'Step out to create tension before the first rep.',
    'Keep the shoulder down and the wrist stacked over the elbow.',
  ],
  'Cable Concentration Curl': [
    'Elbow supported on the thigh, torso braced and still.',
    'Squeeze hard at the top of each rep.',
  ],
  'Cable Overhead Curl': [
    'Stand upright and keep the ribs down — this is not a heave.',
    'Lower until you feel a full biceps stretch behind the arm.',
  ],
  'Dumbbell Alternate Biceps Curl': [
    'Only one arm at a time, with a full pause between reps.',
    'Both shoulders stay down and back throughout the set.',
  ],
  'Dumbbell Zottman Curl': [
    'Supinate on the way up, pronate on the way down.',
    'Rotate slowly — it is a forearm exercise as much as a curl.',
  ],
  'Dumbbell Standing Reverse Curl': [
    'Overhand grip shifts the work to the brachialis and forearms.',
    'Keep the wrists neutral and the elbows pinned to the ribs.',
  ],
  'Barbell Drag Curl': [
    'The bar stays close to the body and the elbows travel backwards.',
    'Bar touches the thighs at the bottom; no momentum allowed.',
  ],
  'Barbell Reverse Curl': [
    'Overhand grip, elbows pinned, slow and controlled eccentric.',
    'Squeeze at the top without letting the shoulders creep forward.',
  ],

  // ── Triceps ──────────────────────────────────────────────────────────────
  'Triceps Dip': [
    'Lower only until the elbows hit about 90°.',
    'Keep the shoulders down and away from the ears.',
    'A slight forward lean biases the chest; stay upright for the triceps.',
  ],
  'Cable Pushdown': [
    'Elbows pinned to the sides; only the forearms move.',
    'Extend to full lockout and squeeze the triceps for a beat.',
  ],
  'Cable Triceps Pushdown V Bar': [
    'Keep the elbows welded to your ribs for the whole set.',
    'Do not let the bar travel up towards your chest.',
  ],
  'Cable Pushdown With Rope Attachment': [
    'Split the rope at the bottom to get an extra triceps contraction.',
    'Keep the upper arms completely still and shrug nothing.',
  ],
  'Barbell Lying Triceps Extension Skull Crusher': [
    'Upper arms stay at roughly 45° and do not flare out.',
    'Only bend and extend at the elbow — no pressing motion.',
    'Stop the bar just above the forehead with the elbows staying in front.',
  ],
  'Barbell Lying Triceps Extension': [
    'Bench grip set narrow, just inside shoulder width.',
    'Keep the upper arms angled forward and slightly in.',
  ],
  'Dumbbell Kickback': [
    'Hinge until the upper arm is parallel to the floor, then lock it there.',
    'Extend the forearm fully and rotate the palm up at the finish.',
  ],
  'Dumbbell Standing Triceps Extension': [
    'Keep the elbows pointing forward and close together.',
    'Lower only to a comfortable depth behind the head.',
  ],
  'Close Grip Push Up': [
    'Hands just inside shoulder width, elbows tracking close to the ribs.',
    'Body in one straight line — this is a triceps push-up, not a chest one.',
  ],
  'Diamond Push Up': [
    'Hands directly under the chest, thumbs and index fingers touching.',
    'Elbows stay tucked; let the triceps do the work.',
  ],
  'Bench Dip Knees Bent': [
    'Hands on the bench edge behind you, fingers pointing forward.',
    'Keep the back close to the bench and lower the hips just below it.',
  ],
  'Cable Rope High Pulley Overhead Tricep Extension': [
    'Step forward to load the cable before extending.',
    'Keep the elbows pointing straight forward for the whole set.',
  ],
  'Ez Bar Close Grip Bench Press': [
    'Use the angled bar for a narrower, wrist-friendlier grip.',
    'Keep the upper arms tight to the torso throughout the press.',
  ],
  'Barbell Jm Bench Press': [
    'Only the forearms move — the upper arms stay locked to the torso.',
    'Extremely intense; use a spotter and a light load.',
  ],
  'Dumbbell Seated Triceps Extension': [
    'Back against the bench, arms bent 90° with the elbows in front.',
    'Extend fully and squeeze — no lower-back arching.',
  ],
  'Bodyweight Kneeling Triceps Extension': [
    'Knees under the hips, glutes squeezed, torso perfectly still.',
    'Bend only at the elbows and keep the upper arms vertical.',
  ],
  'Dumbbell Tate Press': [
    'Lower the dumbbells to the sides of the head, upper arms vertical.',
    'Then extend the forearms only — the elbows stay pinned in place.',
  ],

  // ── Legs ─────────────────────────────────────────────────────────────────
  'Barbell Full Squat': [
    'Brace hard, knees tracking over the toes, hips sit back and down.',
    'Depth to at least parallel, keeping the heels planted.',
    'Drive up through the whole foot and finish with the glutes.',
  ],
  'Barbell Low Bar Squat': [
    'Bar sits on the rear delts, hands just outside shoulder width.',
    'Stay more upright than a high bar and keep the ribs stacked.',
    'The moment the lower back rounds, the set is over.',
  ],
  'Barbell Front Squat': [
    'Elbows high throughout — the moment they drop, so does the bar.',
    'Stay as upright as possible and keep the torso braced.',
  ],
  'Smith Squat': [
    'Set the bar just below the hips for a comfortable depth.',
    'The fixed bar path makes this ideal for nailing depth and tempo.',
  ],
  'Dumbbell Goblet Squat': [
    'Hold the bell at the chin with both hands for a counterbalance.',
    'Elbows inside the knees, chest tall, sit down between the hips.',
  ],
  'Barbell Jump Squat': [
    'Start with the hips below parallel and jump explosively straight up.',
    'Land softly through the whole foot and absorb straight into the next rep.',
  ],
  'Smith Leg Press': [
    'Lower until the hips start to tuck under the seat, no further.',
    'Do not let the lower back round off the pad at the bottom.',
  ],
  'Lever Leg Extension': [
    'Align the knee joint with the machine pivot before lifting.',
    'Squeeze the quad at the top and control the descent.',
  ],
  'Lever Lying Leg Curl': [
    'Keep the hips pinned to the bench — do not let them lift.',
    'Curl through the hamstrings and pause at the peak.',
  ],
  'Bodyweight Standing Calf Raise': [
    'Full stretch at the bottom, then drive onto the balls of the feet.',
    'Pause for a second at the top; calves respond to a slow tempo.',
  ],
  'Barbell Romanian Deadlift': [
    'The bar stays close to the legs for the entire rep.',
    'Hinge at the hips until you feel a hamstring stretch — back stays flat.',
    'This is a hip hinge, not a squat: the knees bend only slightly.',
  ],
  'Dumbbell Romanian Deadlift': [
    'Soft knees, flat back, and the bells brushing the thighs at the bottom.',
    'Push the hips back rather than lowering straight down.',
  ],
  'Barbell Single Leg Split Squat': [
    'Front foot far enough forward that the knee stays behind the toes.',
    'Lower straight down and keep the hips square to the front.',
  ],
  'Barbell Glute Bridge': [
    'Pad the bar with a thick cushion, especially with heavy loads.',
    'Chin tucked, ribs down, and finish with the glutes fully squeezed.',
  ],
  'Low Glute Bridge On Floor': [
    'Drive through the heels and squeeze the glutes at the top.',
    'Keep the hips level; one hip dropping out means a weak side.',
  ],
  'Dumbbell Step Up': [
    'Whole foot on the box, and stand up using the heel.',
    'Avoid bouncing off the step at the top of each rep.',
  ],
  'Barbell Squat Jump Step Rear Lunge': [
    'Split the feet front to back and drop the rear knee straight down.',
    'Keep the front shin vertical and drive up through the whole front foot.',
  ],
  'Standing Calves Calf Stretch': [
    'Back heel down, knee straight, lean into the wall to load the calf.',
    'Hold the stretch rather than bouncing through it.',
  ],
  'Kettlebell Front Squat': [
    'Bell racked at the shoulders, elbows high, back as upright as possible.',
    'Sit between the hips and keep the bell from drifting forward.',
  ],
  'Barbell Wide Squat': [
    'Take a stance about 1.5× shoulder width with the toes turned out.',
    'Sit between the hips, knees tracking over the toes.',
  ],
  'Weighted Squat': [
    'Load up gradually — add weight only when the last rep was clean.',
  ],

  // ── Core ─────────────────────────────────────────────────────────────────
  'Power Point Plank': [
    'One straight line from head to heels — no sagging and no piking.',
    'Squeeze the glutes and brace as if taking a punch to the stomach.',
    'Stop the set the moment the hips start to drop.',
  ],
  'Weighted Front Plank': [
    'Add the load across the back, not the neck.',
    'The extra weight must not change your shape at all.',
  ],
  'Bodyweight Incline Side Plank': [
    'Stack the shoulders and hips, and push the hips up towards the ceiling.',
    'Forearm under the shoulder, body in one long line.',
  ],
  'Hanging Leg Raise': [
    'Curl the pelvis up at the top rather than just lifting the legs.',
    'No swinging — the lower back must stay completely still.',
    'Bend the knees only if the lower back starts to round.',
  ],
  'Hanging Straight Leg Raise': [
    'Lower only as far as you can without the lower back arching.',
    'Hips stay square and the legs stay straight throughout.',
  ],
  'Hanging Leg Hip Raise': [
    'Drive the hips up as if trying to touch the bar with your knees.',
    'Keep the shoulders from swinging behind the bar.',
  ],
  'Crunch Floor': [
    'Curl the ribs towards the pelvis — do not pull on the neck.',
    'Lift the shoulder blades off the floor and pause for a beat.',
  ],
  'Cable Kneeling Crunch': [
    'Kneel and hug the rope to your chest, keeping the hips still.',
    'Curl the ribs down and squeeze the abs hard at the bottom.',
  ],
  'Band Bicycle Crunch': [
    'Rotate so the elbow meets the knee on the same side.',
    'Keep the lower back flat on the floor the whole time.',
  ],
  'Lying Leg Raise Flat Bench': [
    'Press the lower back into the floor and lift only as high as you control.',
    'Lower slowly without letting the heels touch down.',
  ],
  'Russian Twist': [
    'Rotate from the upper back, not just flapping the arms side to side.',
    'Keep the chest lifted and the neck long.',
  ],
  'Cable Twist': [
    'Stand tall and rotate through the ribcage.',
    'Control the return so the torso untwists slowly.',
  ],
  'Decline Sit Up': [
    'Curl up rather than sitting all the way to vertical.',
    'Cross the arms and rotate each rep to hit the obliques.',
  ],
  '3 4 Sit Up': [
    'Keep the arms alongside the body and curl up slowly.',
    'Lower through a long eccentric rather than bouncing.',
  ],
  'Jackknife Sit Up': [
    'Keep the legs off the floor as you reach up to touch them.',
    'Control the descent rather than dropping onto the back.',
  ],
  'Captains Chair Straight Leg Raise': [
    'Legs stay perfectly straight and the lower back never arches.',
    'Curl the pelvis at the top for the full range.',
  ],
  'Reverse Crunch': [
    'Curl the hips up off the floor and lift the glutes slightly.',
    'No neck pulling — the movement is entirely in the hips.',
  ],
  'V Sit On Floor': [
    'Balance behind the sitting bones with the chest open.',
    'Keep the legs straight and lift the chest towards the thighs.',
  ],
  'Front Plank With Twist': [
    'Hold the side plank position with the hips stacked and lifted.',
    'Rotate from the core, not the arm, and keep the shoulders stacked.',
  ],
  'Weighted Russian Twist': [
    'Heavier is not better here — the obliques need control, not load.',
    'Rotate through the ribcage with the feet lifted or lightly grounded.',
  ],
};

/** Curated cues for an exercise, or `undefined` when none are hand-written. */
export function getFormCues(exerciseName: string): readonly string[] | undefined {
  const cues = CUES[exerciseName];
  return cues && cues.length > 0 ? cues : undefined;
}

/** How many movements in the catalogue have hand-written cues. */
export const CURATED_CUE_COUNT = Object.keys(CUES).length;
