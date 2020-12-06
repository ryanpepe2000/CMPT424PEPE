/* ----------------------------------
   DeviceDriverHardDrive.ts

   The Kernel Hard Drive Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHardDrive extends DeviceDriver {

        // Initialize a dictionary with operations and respective service routines
        private ACTION =  {
            "create" : this.createFile,
            "read" : this.readFile,
            "write" : this.writeFile,
            "delete" : this.deleteFile,
            "format" : this.format,
            "list" : this.listFiles
        };

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();

            this.driverEntry = this.krnHDDriverEntry;
            this.isr = this.krnHDDispatch;
        }

        public krnHDDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnHDDispatch(params) {
        }

        public createFile(params) {

        }

        public readFile(params) {

        }

        public writeFile(params) {

        }

        public deleteFile(params) {

        }

        public format(params) {

        }

        public listFiles(params){

        }
    }
}
