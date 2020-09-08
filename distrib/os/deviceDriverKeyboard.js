/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.symbolList = new AsciiMap();
            _this.shiftedList = new AsciiMap();
            // Populate symbol list and shifted list
            // key --> ASCII code string
            // val --  Character string
            _this.symbolList = _this.symbolList.set(222, "'").set(188, ",").set(189, "-").set(190, ".").set(191, "/").set(186, ";").set(187, "=")
                .set(219, "[").set(220, "\\").set(221, "]").set(176, "`");
            _this.shiftedList = _this.shiftedList.set(48, ")").set(49, "!").set(50, "@").set(51, "#").set(52, "$").set(53, "%")
                .set(54, "^").set(55, "&").set(56, "*").set(57, "(").set(222, "\"").set(188, "<").set(189, "_").set(190, ">")
                .set(191, "?").set(186, ":").set(187, "+").set(219, "{").set(220, "|").set(221, "}").set(176, "~");
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            if (params[0] == null || params[1] == null)
                _Kernel.krnTrapError("Invalid parameters passed to keyboard"); //prevents unwanted inputs from making it into code
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) || // digits
                (keyCode == 32) || // space
                (keyCode == 8) || // backspace
                (keyCode == 9) || // tab
                (keyCode == 13) || // enter
                this.symbolList.has(keyCode) || // Every symbol on traditional keyboard
                (this.shiftedList.has(keyCode) && isShifted)) { // All characters that should be shifted
                // Check to see if it is necessary to convert chr to symbol
                console.log("Long statement: " + chr);
                if (isShifted === true) {
                    chr = this.shiftedList.get(keyCode);
                }
                else if (this.symbolList.has(keyCode)) {
                    chr = this.symbolList.get(keyCode);
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 38) || (keyCode == 40)) { // Arrow keys
                console.log("Arrow Statement code: " + chr);
                switch (keyCode) {
                    case 38:
                        chr = "up"; // Setting to word 'up' because of interference with js chr 38
                        break;
                    case 40:
                        chr = "down"; // Setting to word 'down' because of interference with js chr 38
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
    var AsciiMap = /** @class */ (function () {
        function AsciiMap() {
            this.key = [];
            this.val = [];
        }
        AsciiMap.prototype.set = function (key, val) {
            if (!this.has(key)) {
                this.key[this.key.length] = key;
                this.val[this.val.length] = val;
            }
            return this;
        };
        AsciiMap.prototype.get = function (key) {
            for (var i = 0; i < this.key.length; i++) {
                if (this.key[i] === key)
                    return this.val[i];
            }
            return null;
        };
        AsciiMap.prototype.has = function (key) {
            for (var i = 0; i < this.key.length; i++) {
                if (this.key[i] === key)
                    return true;
            }
            return false;
        };
        return AsciiMap;
    }());
})(TSOS || (TSOS = {}));
