/* ------------
     hostLogDisplay.ts

     HTML constructor for host log card

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class HostLogDisplay {
        constructor() {
        }
        buildElement(msg, source) {
            // Note the OS CLOCK.
            let clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            let now = new Date().getTime();
            // Build the log string.
            let str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            let taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        }
    }
    TSOS.HostLogDisplay = HostLogDisplay;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=hostLogDisplay.js.map