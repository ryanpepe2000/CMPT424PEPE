/* ------------
     taskBarDisplay.ts

     HTML constructor for taskbar card

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var TaskBarDisplay = /** @class */ (function () {
        function TaskBarDisplay() {
        }
        TaskBarDisplay.buildElement = function () {
            // Update the graphical taskbar
            var taTaskBar = document.getElementById("taTaskBar");
            taTaskBar.innerHTML = "";
            var dateElement = document.createElement('p');
            var statusElement = document.createElement('p');
            dateElement.innerHTML = "Date: " + new Date().toLocaleString();
            statusElement.innerHTML = "Status: " + _Status;
            taTaskBar.appendChild(dateElement);
            taTaskBar.appendChild(statusElement);
        };
        return TaskBarDisplay;
    }());
    TSOS.TaskBarDisplay = TaskBarDisplay;
})(TSOS || (TSOS = {}));
