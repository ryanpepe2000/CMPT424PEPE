/* ------------
     processManager.ts

     Contains definitions and initialization logic for processManager and ProcessControlBlock. The processManager
     is the overarching manager of processes, while the PCB is simply the ADT that stores relevant information
     about a process.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processes) {
        }
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock() {
        }
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
