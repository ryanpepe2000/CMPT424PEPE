/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize the memory accessor
            _MemoryAccessor = new MemoryAccessor();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Hard Drive Device Driver
            this.krnTrace("Loading the hard drive device driver.");
            _krnHDDriver = new DeviceDriverHardDrive();
            _krnHDDriver.driverEntry();
            this.krnTrace(_krnHDDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */
            // Update all displays on every clock pulse
            Control.updateAllDisplays();
            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
                _CPU.cycle();
            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case EXECUTE_PROCESS_IRQ:
                    this.krnExecuteProcess();         // Kernel system call to execute a process
                    break;
                case BREAK_PROCESS_IRQ:
                    this.krnBreakProcess(params);     // Kernel system call to break program
                    break;
                case PRINT_PROCESS_IRQ:
                    this.krnPrintUserPrg(params);     // Kernel system call to print user program output
                    break;
                case PROCESS_ERROR_IRQ:
                    this.krnProcessError(params);     // Kernel system call to print user program output
                    break;
                case DISK_OPERATION_IRQ:
                    _krnHDDriver.isr(params);         // Kernel mode device driver for disk ops
                    break;
                case DISK_OPERATION_ERROR_IRQ:
                    this.krnDiskOpError(params);         // Kernel mode device driver for disk operation error
                    break;
                case DISK_OUTPUT_IRQ:
                    this.krnDiskOutput(params);     // Kernel system call to print file contents from disk buffer
                    break;
                case CONTEXT_SWITCH_IRQ:
                    this.krnContextSwitch(params);     // Kernel system call to print user program output
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile

        public krnExecuteProcess() {
            _CPU.execute();
        }

        public krnPrintUserPrg(params: any[]){
            _Console.putText(params[0]);
        }

        public krnContextSwitch(params: any[]){
            _Scheduler.contextSwitch();
            this.krnTrace("Performing Context Switch");
        }

        public krnBreakProcess(params: any[]) {
            // Puts "Program completion message" and advances line with new prompt
            _CPU.isExecuting = _ProcessManager.getReadyQueue().getSize() >= 1;
            _Console.advanceLine();
            _Console.putText(params[0]);
            _Console.advanceLine();
            let pcb = _ProcessManager.getPCB(params[1]);
            if (pcb !== undefined){
                _Console.putText("-----------------------------");
                _Console.advanceLine();
                _Console.putText("Process ID: " + pcb.getPID());
                _Console.advanceLine();
                _Console.putText("Wait Time: " + pcb.waitingTime);
                _Console.advanceLine();
                _Console.putText("Turnaround Time: " + pcb.turnaroundTime);
                _Console.advanceLine();
                _Console.putText("-----------------------------");
                _Console.advanceLine();
            }
            _Console.putText(_OsShell.promptStr);
            _CPU.clearCPU();
            // This will switch contexts, thereby resetting quantum
            // (prevents zombie processes until quantum is reached)
            try {
                _Scheduler.contextSwitch();
            } catch (Exception){
                this.krnTrace("Unable to context switch")
            }
        }

        public krnProcessError(params: any[]) {
            // Puts "Program completion message" and advances line with new prompt
            _Scheduler.killProcess(_ProcessManager.getRunning());
            _Console.advanceLine();
            _Console.putText(params[0]);
            _Console.advanceLine();
            _Console.putText(_OsShell.promptStr);
        }
        public krnDiskOpError(params: any[]) {
            _Console.putText(params[0]);
            _Console.advanceLine();
            _Console.putText(_OsShell.promptStr);
        }
        public krnDiskOutput(params: any[]){
            for (let chr of params){
                _Console.putText(chr);
            }
            _Console.advanceLine();
            _Console.putText(_OsShell.promptStr);
        }
        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            const img = <CanvasImageSource>document.getElementById("bsod");
            Control.resetCanvas();
            _DrawingContext.drawImage(img, 0, 0);
            setTimeout(function () {
                location.reload();
            }, 5000);
            this.krnShutdown();
        }

    }
}
