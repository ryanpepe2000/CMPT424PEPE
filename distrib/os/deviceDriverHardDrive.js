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
            _this.ACTION = {
                "create": _this.createFile,
                "read": _this.readFile,
                "write": _this.writeFile,
                "delete": _this.deleteFile,
                "format": _this.format,
                "list": _this.listFiles
            };
            _this.driverEntry = _this.krnHDDriverEntry;
            _this.isr = _this.krnHDDispatch;
            return _this;
        }
        DeviceDriverHardDrive.prototype.krnHDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverHardDrive.prototype.krnHDDispatch = function (params) {
        };
        DeviceDriverHardDrive.prototype.createFile = function (params) {
        };
        DeviceDriverHardDrive.prototype.readFile = function (params) {
        };
        DeviceDriverHardDrive.prototype.writeFile = function (params) {
        };
        DeviceDriverHardDrive.prototype.deleteFile = function (params) {
        };
        DeviceDriverHardDrive.prototype.format = function (params) {
        };
        DeviceDriverHardDrive.prototype.listFiles = function (params) {
        };
        return DeviceDriverHardDrive;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
