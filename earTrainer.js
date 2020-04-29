var out = null;
var input = null;
var KEY_DOWN = 144;
var KEY_UP = 128;

var C_NOTES = {
	"C1" : 0x30 - 12 - 12,
	"C2" : 0x30 - 12,
	"C3" : 0x30,
	"C4" : 0x3C,
	"C5" : 0x48,
	"C6" : 0x48+12,
	//"C7" : 0x48+12+12,
	//"C8" : 0x48+12+12+12,
};

var midi_inputs = [];
var midi_outputs = [];

var noteLabel = null;

$( document ).ready(function() {
	navigator.requestMIDIAccess().then(onMidiAccess, onMidiFailure);
	$('#pianoInput').jsRapPiano({
		octave:1,
		octaves:7,
		onClick:onPianoClick,
		highlightMiddleC: true,
		fullPiano: true
	});
});

function onMidiFailure()
{
	console.log("no midi for you");						
}

function onMidiAccess(access)
{
	// Get lists of available MIDI controllers
	const inputs = access.inputs.values();
	const outputs = access.outputs.values();						
	for (var output of access.outputs.values()) {
		midi_outputs.push(output);
		if (out == null) {
			out = output;
		}
		$('#midi_outputs').append("<option>" + output.name + "</option>");
		playRandomNote();
		console.log(output);        												
	}

	for (var inputIt of access.inputs.values()) {
		midi_inputs.push(inputIt);
		inputIt.onmidimessage = getMIDIMessage;
		$('#midi_inputs').append("<option>" + output.name + "</option>");
		console.log(inputIt);
	}

	access.onstatechange = function(e) {
	// Print information about the (dis)connected MIDI controller
			console.log(e.port.name, e.port.manufacturer, e.port.state);
	};											
}

function playRandomNote()
{						
	var velocity = 0x7f;
	var channel = 0x90;

	var keys = Object.keys(C_NOTES);
	var randomNoteIndex = keys[Math.floor(keys.length * Math.random())];
	var note = C_NOTES[randomNoteIndex];
	noteLabel = randomNoteIndex;							
	playNote(channel, note, velocity);

	//out.send([ channel, note, velocity ]);

	setTimeout(showNoteDisplay, 1000);					
}

function playNote(channel, note, velocity)
{						
	if (out == null) {
		console.log("midi is null");
	} else {
		out.send([ channel, note, velocity ]);
	}
}					

function showNoteDisplay()
{						
	$("#noteDisplay").html("Play the note you heard on the piano");
	//speechSynthesis.speak(new SpeechSynthesisUtterance("Play the note that you head on the piano"));

//						$.speak("Play the note that you head on the piano", "en");
	//console.log(noteLabel);
	// document.getElementById("noteDisplay").innerHTML = noteLabel;
	// setTimeout(function () {
	// 	document.getElementById("noteDisplay").innerHTML = "";
	// }, 1000);
}

function onPianoClick(ev1)
{
	console.log("Piano clicked");
	var velocity = 0x7f;
	var channel = 0x90;

	playNote(channel, ev1, velocity);

	if (noteLabel != null) {
		if (C_NOTES[noteLabel] == ev1) {
			$( "#noteDisplay" ).html("Correct! " + noteLabel);								
			setTimeout(playRandomNote, 500);
			//speechSynthesis.speak(new SpeechSynthesisUtterance("Yes, it's good!  Thank you Kai!  Press the random button to hear the next note."));
		} else {
			$( "#noteDisplay" ).html("No, it's not good!");
			//speechSynthesis.speak(new SpeechSynthesisUtterance("No, it's not good!  Please push the replay button then you can play it again.  Thank you."));
			//$.speak("No, it's not good!  Please push the replay button then you can play it again.  Thank you.", "en");
		}
	}
}

function playNoteAgain()
{
	var velocity = 0x7f;
	var channel = 0x90;

	playNote(channel, C_NOTES[noteLabel], velocity);						
}

function stopNote(note, velocity)
{
	if (out == null) {
		console.log("midi is null");
	} else {
		out.send([ KEY_UP, note, velocity ]);
	}
}

function getMIDIMessage(midiMessage) {
	switch (midiMessage.data[0]) {
		case KEY_DOWN:
			onPianoClick(midiMessage.data[1]);
			break;
		case KEY_UP:
			stopNote(midiMessage.data[1], midiMessage.data[2]);
			break;
		case 248:
			break;					
	}
}
