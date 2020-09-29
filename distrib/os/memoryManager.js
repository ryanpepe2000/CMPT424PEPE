/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        // Returns true if memory is available (all memory is untaken)
        MemoryManager.memoryAvailable = function (programLength) {
            if (programLength > _Memory.memory.length)
                return false;
            for (var i = 0; i < _Memory.memory.length; i++) {
                if (_Memory.getMemory(i.toString()) !== "00")
                    return false;
            }
            return true;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
