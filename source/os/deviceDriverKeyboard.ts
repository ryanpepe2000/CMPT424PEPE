/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver

    export class DeviceDriverKeyboard extends DeviceDriver {
        public symbolList: AsciiMap = new AsciiMap();
        public shiftedList: AsciiMap = new AsciiMap();

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();

            // Populate symbol list and shifted list
            // key --> ASCII code string
            // val --  Character string
            this.symbolList = this.symbolList.set(222, "'").set(188, ",").set(189, "-").set(190, ".").set(191, "/").set(186,";").set(187, "=")
                .set(219,"[").set(220,"\\").set(221,"]").set(176, "`");
            this.shiftedList = this.shiftedList.set(48,")").set(49,"!").set(50,"@").set(51,"#").set(52,"$").set(53,"%")
                .set(54,"^").set(55,"&").set(56,"*").set(57,"(").set(222, "\"").set(188, "<").set(189, "_").set(190, ">")
                .set(191, "?").set(186,":").set(187, "+").set(219,"{").set(220,"|").set(221,"}").set(176, "~");

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
                        this.symbolList.has(keyCode)        ||   // Every symbol on traditional keyboard
                        (this.shiftedList.has(keyCode) && isShifted)) {         // All characters that should be shifted
                // Check to see if it is necessary to convert chr to symbol
                if (isShifted === true) {
                    chr = this.shiftedList.get(keyCode);
                } else if (this.symbolList.has(keyCode)){
                    chr = this.symbolList.get(keyCode);
                } else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 38) || (keyCode == 40)){ // Arrow keys
                switch (keyCode){
                    case 38:
                        chr = "up"; // Setting to word 'up' because of interference with js chr 38
                        break;
                    case 40:
                        chr = "down"; // Setting to word 'down' because of interference with js chr 38
                        break;
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }

    class AsciiMap{
        public key: number[] = [];
        public val: string[] = [];
        constructor() {}

        public set(key: number, val: string): AsciiMap {
            if (!this.has(key)) {
                this.key[this.key.length] = key;
                this.val[this.val.length] = val;
            }
            return this;
        }

        public get(key:number): string{
            for (let i = 0; i < this.key.length; i++){
                if (this.key[i] === key) return this.val[i];
            }
            return null;
        }

        public has(key:number): boolean{
            for (let i = 0; i < this.key.length; i++){
                if (this.key[i] === key) return true;
            }
            return false;
        }
    }
}
