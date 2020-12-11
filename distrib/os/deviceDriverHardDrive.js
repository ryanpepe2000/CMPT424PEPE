/* ----------------------------------
   DeviceDriverHardDrive.ts

   The Kernel Hard Drive Device Driver.
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
    var DeviceDriverHardDrive = /** @class */ (function (_super) {
        __extends(DeviceDriverHardDrive, _super);
        function DeviceDriverHardDrive() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            // Initialize a dictionary with operations and respective service routines
            _this.OPERATIONS = {
                "create": _this.createFile,
                "read": _this.readFile,
                "write": _this.writeFile,
                "delete": _this.deleteFile,
                "format": _this.format,
                "list": _this.listFiles,
                "swap": _this.swapProcess
            };
            _this.driverEntry = _this.krnHDDriverEntry;
            _this.isr = _this.krnHDDispatch;
            return _this;
        }
        DeviceDriverHardDrive.prototype.isValidOperation = function (operation) {
            return this.OPERATIONS[operation] !== undefined;
        };
        DeviceDriverHardDrive.prototype.krnHDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        };
        DeviceDriverHardDrive.prototype.krnHDDispatch = function (params) {
            // Get name of disk operation and remove it from param list
            var operation = params[0];
            params = params.slice(1);
            // Check validity of operation
            if (this.isValidOperation(operation)) {
                // Run the specified operation
                this.OPERATIONS[operation](params);
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid Disk Operation"]));
            }
        };
        DeviceDriverHardDrive.prototype.createFile = function (params) {
            var filename = params[0];
            if (filename.indexOf("~") === -1) {
                _HardDriveManager.createFile(filename);
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        };
        DeviceDriverHardDrive.prototype.readFile = function (params) {
            var filename = params[0];
            if (filename.indexOf("~") === -1) {
                var fileText = _HardDriveManager.readFile(filename);
                if (fileText.length > 0) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, fileText.split("")));
                }
                else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["File is empty."]));
                }
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        };
        DeviceDriverHardDrive.prototype.writeFile = function (params) {
            // Get filename
            var filename = params[0];
            if (filename.indexOf("~") === -1) {
                // Collect the file text
                var fileText = "";
                var i = 1;
                while (params[i] !== undefined) {
                    fileText += params[i] + " ";
                    i++;
                }
                // Remove white space on both sides of quotes
                fileText = fileText.replace(/((\s)+^)|(\s+$)/, "");
                // Valid file text was entered
                if (fileText.charAt(0) === '"' && fileText.charAt(fileText.length - 1) === '"') {
                    _HardDriveManager.writeFile(filename, fileText.slice(1, fileText.length - 1));
                }
                else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Invalid Usage. Type 'help' for more details."]));
                }
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        };
        DeviceDriverHardDrive.prototype.deleteFile = function (params) {
            var fileName = params[0];
            if (fileName.indexOf("~") === -1) {
                _HardDriveManager.deleteFile(fileName);
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Could not read value '~'."]));
            }
        };
        DeviceDriverHardDrive.prototype.format = function (params) {
            var canFormat = true;
            if (canFormat) {
                _HardDriveManager.filenameDict = {};
                _HardDriveManager.init();
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Format could not be performed."]));
            }
        };
        DeviceDriverHardDrive.prototype.listFiles = function (params) {
            var dir = _HardDriveManager.filenameDict;
            if (Object.keys(dir).length > 0) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, ["Files: "]));
                for (var filename in _HardDriveManager.filenameDict) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OUTPUT_IRQ, filename.split("")));
                }
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Directory is empty."]));
            }
        };
        DeviceDriverHardDrive.prototype.swapProcess = function (params) {
            // Temp variables for current pcb info
            var currPCB = params[0];
            var currSegment = currPCB.getSegment();
            // Get the process code from the current process
            var currCode = _MMU.readSegment(currPCB.getSegment());
            // Temp variables for pcb on disk
            var diskPCB = params[1];
            var diskSegment = diskPCB.getSegment();
            // Swap Segments (logical for MMU)
            diskPCB.updateSegment(currSegment);
            currPCB.updateSegment(diskSegment);
            _Scheduler.storeToCPU(diskPCB);
            _CPU.updateSegment(currSegment);
            // Swap the disk process out
            var diskFilename = _HardDriveManager.getFilename(diskPCB);
            var diskCode = _HardDriveManager.readFile(diskFilename);
            var diskCodeArray = diskCode.match(/..?/g);
            _MMU.fillSegment(currSegment, diskCodeArray);
            _HardDriveManager.deleteFile(diskFilename);
            // Swap the current process in
            // Create and write to new swap file
            var currFilename = _HardDriveManager.getFilename(currPCB);
            _HardDriveManager.createFile(currFilename);
            _HardDriveManager.writeFile(currFilename, currCode);
        };
        return DeviceDriverHardDrive;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
