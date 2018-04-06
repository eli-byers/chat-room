$(document).ready(function () {

    //=================================== Init =====================================

    window.onresize = function resize(){
        var board_height = $('.board').outerHeight(true) - $('.message_area').height() - 10;
        $('#message_board').outerHeight(board_height);
    }
    window.onresize();
    $("#message_text").focus();

    //=================================== Ports ====================================

    //	On Connection
    //
    var socket_id = "";
    var name = prompt("Please enter your name");
    if (name != '' && name != null) {
        // do something with the input
        var socket = io.connect();

        // New User
        //
        socket.emit("got_new_user", { "name": name });
        socket.on('got_new_user_response', function (data) {
            console.log("got_new_user_response", data.id);
            socket_id = data.id;
            users = data.all_users;
            // fill in users
            for (i in users) {
                if (users[i].id == socket_id) {
                    $("#user_names").append("<p><b><span class='red'>" + users[i].name + "</span></b></p>");
                } else {
                    var id = users[i].id.replace("/#", "");
                    $("#user_names").append("<p id='" + id + "'><b>" + users[i].name + "</b></p>");
                }
            }
            // fill in messages
            messages = data.all_messages;
            $("#place_holder").remove();
            for (i in messages) {
                $("#message_board").append("<p><b>" + messages[i].user_name + ":</b> " + messages[i].content + "</p>");
            }
            $("#message_board").append("<h5 style='text-align: center;'>Welcome to the room <span class='red'>" + name + "</span>!</h5>");
            scrollToBottom(false);
        });

        // Updated - Users
        //
        socket.on('new_user', function (data) {
            $("#message_board").append("<p style='text-align: center;'><span class='grey'><b>" + data.name + "</b> joined the room.</span></p>");
            scrollToBottom();
            var user_id = data.id.replace("/#", "");
            $("#user_names").append("<p id='" + user_id + "'><b>" + data.name + "</b></p>");
        });

        // Updated - Messages
        //
        socket.on('new_messages', function (data) {
            $("#message_board").append("<p><b>" + data.user_name + ":</b> " + data.content + "</p>");
            scrollToBottom();
        });

        // User Left
        //
        socket.on('user_left', function (data) {
            var user = data.id.replace("/#", "");
            $("#" + user).remove();
            $("#message_board").append("<p style='text-align: center;'><span class='grey'><b>" + data.name + "</b> left the room.</span></p>");
            scrollToBottom();
        });
    }

    //================================== Messages ==================================

    // Submit on Enter
    //
    $("#message_text").on('keydown', function(e){
        console.log(e)
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            $("#message").submit();
        }
    })

    // Submit Message
    //
    $("#message").submit(function (event) {
        console.log("submit");
        event.preventDefault();
        var message = $("#message_text").val();
        if (message != "") {
            message = { "user_name": name, "content": message };
            $("#message_text").val("");
            $("#message_text").focus();
            $("#message_board").append("<p><b class='red'>" + name + ":</b> " + message.content + "</p>");
            scrollToBottom(false);
            socket.emit("new_message", { "new_message": message });
        }
    });

    // Scroll To Bottom
    //
    function scrollToBottom(test = true) {
        if (test) {
            // if message_board is at the bottom
            if ($("#message_board").scrollTop() + $("#message_board").innerHeight() >= $("#message_board")[0].scrollHeight - 50) {
                $("#message_board").animate({ scrollTop: $("#message_board")[0].scrollHeight }, 1000);
            } else {
                // green border on message_board
                $("#message_board").css({
                    "border": "2px solid #2ecc71",
                    "padding": "1.13em"
                });
                // change back to default color after 200ms
                setTimeout(function () {
                    // for day theme
                    if ($("#day_night").html() == "Dark") {
                        $("#message_board").css({
                            "border": "1px solid #bdc3c7",
                            "padding": "1.2em"
                        });
                    }
                    // for night theme
                    else {
                        $("#message_board").css({
                            "border": "1px solid #262626",
                            "padding": "1.2em"
                        });
                    }
                }, 200);
            }
        } else {
            $("#message_board").animate({ scrollTop: $("#message_board")[0].scrollHeight }, 1000);
        }
    }

    //=================================== Theme ====================================

    // Toggle Theme
    //
    $("#day_night").click(function () {
        $("body").toggleClass('dark');
        $("#day_night").html($("body").hasClass('dark') ? "Light" : "Dark")
        $("#message_text").focus();
    });
});