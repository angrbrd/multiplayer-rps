/*
//
//  Global Variables
//
*/

// Store the values for each of the two players
var player1 = null;
var player2 = null;

/*
//
//  Firebase Database Section
//
*/

// Get a reference to the database service
var database = firebase.database();

// Attach a listener to the database /players/ node to listen for any changes
database.ref("/players/").on("value", function(snapshot) {
	// Check for existence of player 1 in the database
	if (snapshot.child("player1").exists()) {
		console.log("Player 1 exists");

		// Record player1 data
		player1 = snapshot.val().player1;
		console.log(JSON.stringify(player1));

		// Update player1 display
		$("#playerOneName").text(player1.name);
	} else {
		console.log("Player 1 does NOT exist");

		player1 = null;

		// Update player1 display
		$("#playerOneName").text("Waiting for Player 1...");
	}

	// Check for existence of player 2 in the database
	if (snapshot.child("player2").exists()) {
		console.log("Player 2 exists");

		// Record player2 data
		player2 = snapshot.val().player2;
		console.log(JSON.stringify(player2));

		// Update player2 display
		$("#playerTwoName").text(player2.name);
	} else {
		console.log("Player 2 does NOT exist");

		player2 = null;

		// Update player2 display
		$("#playerTwoName").text("Waiting for Player 2...");
	}
});

// Attach an event handler to the "Submit" button to add a new user to the database
$("#add-name").on("click", function(event) {
	event.preventDefault();

	// Adding player1
	if (player1 === null) {
		console.log("Adding Player 1");

		player1 = {
			name: $("#name-input").val().trim(),
			win: 0,
			loss: 0,
			tie: 0,
			choice: ""
		};

		// Add player1 to the database
		database.ref().child("/players/player1").set(player1);

		// If this user disconnects by closing or refreshing the browser, remove the user from the database
		database.ref("/players/player1").onDisconnect().remove();
	} else if( (player1 !== null) && (player2 === null) ) {
		// Adding player2
		console.log("Adding Player 2");

		player2 = {
			name: $("#name-input").val().trim(),
			win: 0,
			loss: 0,
			tie: 0,
			choice: ""
		};

		// Add player2 to the database
		database.ref().child("/players/player2").set(player2);

		// If this user disconnects by closing or refreshing the browser, remove the user from the database
		database.ref("/players/player2").onDisconnect().remove();
	}

	// Reset the name input box
	$("#name-input").val("");	
});
