function addComment(id) {
    if (document.querySelector('#comment_button') == null) {
        $("#viewer").append(`<canvas id="myCanvas"></canvas>`);
    }
    let canvas = document.getElementById("myCanvas"),
    context = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height;

let mouse = { x: 0, y: 0 };
let draw = false;

canvas.addEventListener("mousedown", function (e) {

    mouse.x = e.pageX;
    mouse.y = e.pageY;
    draw = true;
    context.beginPath();
    context.moveTo(mouse.x, mouse.y);
});
canvas.addEventListener("mousemove", function (e) {

    if (draw == true) {

        mouse.x = e.pageX;
        mouse.y = e.pageY;
        context.lineTo(mouse.x, mouse.y);
        context.strokeStyle = "#ff0000";
        context.stroke();
    }
});
canvas.addEventListener("mouseup", function (e) {

    mouse.x = e.pageX;
    mouse.y = e.pageY;
    context.lineTo(mouse.x, mouse.y);
    context.stroke();
    context.closePath();
    draw = false;
});
}

