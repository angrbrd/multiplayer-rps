/*
//
//  Global Variables
//
*/

// Store the objects for each of the two players
var player1 = null;
var player2 = null;

// Store the player names
var player1Name = "";
var player2Name = "";

// Store the name of the player in the user's browser
var yourPlayerName = "";

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
		player1Name = player1.name;
		console.log(JSON.stringify(player1));

		// Update player1 display
		$("#playerOneName").text(player1Name);
	} else {
		console.log("Player 1 does NOT exist");

		player1 = null;
		player1Name = "";

		// Update player1 display
		$("#playerOneName").text("Waiting for Player 1...");
	}

	// Check for existence of player 2 in the database
	if (snapshot.child("player2").exists()) {
		console.log("Player 2 exists");

		// Record player2 data
		player2 = snapshot.val().player2;
		player2Name = player2.name;
		console.log(JSON.stringify(player2));

		// Update player2 display
		$("#playerTwoName").text(player2Name);
	} else {
		console.log("Player 2 does NOT exist");

		player2 = null;
		player2Name = "";

		// Update player2 display
		$("#playerTwoName").text("Waiting for Player 2...");
	}
});

// Attach a listener that detects user disconnection events
database.ref("/players/").on("child_removed", function(snapshot) {
	var msg = snapshot.val().name + " has disconnected!";

	// Get a key for the disconnection chat entry
	var chatKey = database.ref().child("/chat/").push().key;

	// Save the disconnection chat entry
	database.ref("/chat/" + chatKey).set(msg);
});

// Attach a listener to the database /chat/ node to listen for any new chat messages
database.ref("/chat/").on("child_added", function(snapshot) {
	var chatMsg = snapshot.val();
	var chatEntry = $("<div>").html(chatMsg);

	// Change the color of the chat message depending on the user
	if (chatMsg.includes("disconnected")) {
		chatEntry.addClass("chatColorDisconnected");
	} else if (chatMsg.startsWith(yourPlayerName)) {
		chatEntry.addClass("chatColor1");
	} else {
		chatEntry.addClass("chatColor2");
	}

	$("#chatDisplay").append(chatEntry);
	$("#chatDisplay").scrollTop($("#chatDisplay")[0].scrollHeight);
});

/*
//
//  Button Events Section
//
*/

// Attach an event handler to the "Submit" button to add a new user to the database
$("#add-name").on("click", function(event) {
	event.preventDefault();

	// First, make sure that the name field is non-empty
	if ($("#name-input").val().trim() !== "") {
		// Adding player1
		if (player1 === null) {
			console.log("Adding Player 1");

			yourPlayerName = $("#name-input").val().trim();
			player1 = {
				name: yourPlayerName,
				win: 0,
				loss: 0,
				tie: 0,
				choice: ""
			};

			// Add player1 to the database
			database.ref().child("/players/player1").set(player1);

			// Set the turn value to 1, as player1 goes first
			database.ref().child("/turn").set(1);

			// If this user disconnects by closing or refreshing the browser, remove the user from the database
			database.ref("/players/player1").onDisconnect().remove();
		} else if( (player1 !== null) && (player2 === null) ) {
			// Adding player2
			console.log("Adding Player 2");

			yourPlayerName = $("#name-input").val().trim();
			player2 = {
				name: yourPlayerName,
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
	}
});

// Attach an event handler to the chat "Send" button to append the new message to the conversation
$("#chat-send").on("click", function(event) {
	event.preventDefault();

	// First, make sure that the player exists and the message box is non-empty
	if ( (yourPlayerName !== "") && ($("#chat-input").val().trim() !== "") ) {
		// Grab the message from the input box and subsequently reset the input box
		var msg = yourPlayerName + ": " + $("#chat-input").val().trim();
		$("#chat-input").val("");

		// Get a key for the new chat entry
		var chatKey = database.ref().child("/chat/").push().key;

		// Save the new chat entry
		database.ref("/chat/" + chatKey).set(msg);
	}
});
