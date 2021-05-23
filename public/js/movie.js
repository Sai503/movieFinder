$(() => {
    //runs when page loads
    toastr.options = {
        "timeOut": 5000,
        "progressBar": true,
        "newestOnTop": true,
        "positionClass": "toast-bottom-right",
        "tapToDismiss": false
    };
    toastr.info("Please choose the relevant option", "Do you want to see this movie?");

    $("#yes").click(() => {
        saveChoice(2);
    });
    $("#no").click(() => {
        saveChoice(1);
    });
    $("#watched").click(() => {
        saveChoice(3);
    });

});

function saveChoice(choiceID) {
    $.post("/saveMovie", {
        movieID: movieID,
        choiceID: choiceID,
        ajax: true
    }).done(response => {
        toastr.success("Saved!");
        window.location.href = "/movies";
    }).fail(err => {
        console.error(err);
        toastr.error("A problem has occurred when saving data!");
    })
}
