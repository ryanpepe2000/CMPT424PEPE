/* ------------
     taskBarDisplay.ts

     HTML constructor for taskbar card

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class TaskBarDisplay {
        constructor() {
        }
        buildElement() {
            // Update the graphical taskbar
            let taTaskBar = document.getElementById("taTaskBar");
            taTaskBar.innerHTML = "";
            let dateElement = document.createElement('p');
            let statusElement = document.createElement('p');
            dateElement.innerHTML = "Date: " + new Date().toLocaleString();
            statusElement.innerHTML = "Status: " + _Status;
            taTaskBar.appendChild(dateElement);
            taTaskBar.appendChild(statusElement);
        }
    }
    TSOS.TaskBarDisplay = TaskBarDisplay;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=taskBarDisplay.js.map