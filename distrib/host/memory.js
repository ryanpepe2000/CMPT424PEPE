/* ------------
     memory.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(size, // Represents 256 bytes ins
        memArray) {
            if (size === void 0) { size = 0x100; }
            if (memArray === void 0) { memArray = new Array(size); }
            this.size = size;
            this.memArray = memArray;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.size; i++) {
                this.memArray[i] = 0x00;
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
