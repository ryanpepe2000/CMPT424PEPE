/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            if (params[0] == null || params[1] == null) _Kernel.krnTrapError("Invalid parameters passed to keyboard"); //prevents unwanted inputs from making it into code
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 8)                      ||   // backspace
                        (keyCode == 9)                      ||   // tab
                        (keyCode == 13)                     ||   // enter
                        ((keyCode >= 37) && (keyCode <= 40))||   // Arrow keys
                        keyCode == 25 ) {                        // Down arrow
                // Check to see if it is necessary to convert chr to symbol
                if (isShifted === true) {
                    switch (keyCode){
                        case 48: // 0 key
                            chr = ")";
                            break;
                        case 49: //1 key
                            chr = "!";
                            break;
                        case 50: // 2 key
                            chr = "@";
                            break;
                        case 51: // 3 key
                            chr = "#";
                            break;
                        case 52: // 4 key
                            chr = "$";
                            break;
                        case 53: // 5 key
                            chr = "%";
                            break;
                        case 54: // 6 key
                            chr = "^";
                            break;
                        case 55: // 7 key
                            chr = "&";
                            break;
                        case 56: // 8 key
                            chr = "*";
                            break;
                        case 57: // 9 key
                            chr = "(";
                            break;
                        default:
                            chr = String.fromCharCode(keyCode);
                            break;
                    }
                } else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
