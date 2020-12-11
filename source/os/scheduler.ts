/* ------------
     scheduler.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Scheduler {
        private currAlgorithm = "rr";

        constructor(private quantum: number = _Quantum,
                    private counter: number = 0) {
        }

        public runSchedule(): void{
            if (this.currAlgorithm == "rr"){
                this.executeRoundRobin();
            } else if (this.currAlgorithm == "fcfs"){
                this.executeFCFS();
             } else if (this.currAlgorithm == "priority"){
                this.executePriority();
            }
        }

        public setAlgorithm(name: string){
            this.currAlgorithm = name;
        }
        public getAlgorithm(): string{
            return this.currAlgorithm.toUpperCase();
        }

        public runProcess(pcb: ProcessControlBlock){
            // Admitted pcb will be added to the ready queue
            _ProcessManager.getReadyQueue().enqueue(pcb.setState("Ready"));
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
        }

        public runAllProcesses(): boolean {
            let count = 0;
            for (let pcb of _ProcessManager.getProcessList()){
                if (pcb.getState() === "New"){
                    _ProcessManager.getReadyQueue().enqueue(pcb.setState("Ready"));
                    count++;
                }
            }
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
            return count > 0;
        }

        public killProcess(pcb: ProcessControlBlock){
            _ProcessManager.getRunning().setState("Terminated");
            pcb.updateSegment(_ProcessManager.TERMINATED);
            if (_ProcessManager.getReadyQueue().getSize() >= 1){
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
            } else {
                _CPU.isExecuting = false;
            }
        }

        public killAll(){
            _ProcessManager.getRunning().setState("Terminated");
            while (_ProcessManager.getReadyQueue().getSize() >= 1){
                let pcb: ProcessControlBlock = _ProcessManager.getReadyQueue().dequeue();
                if (pcb != undefined){
                    pcb.setState("Terminated");
                    pcb.updateSegment(_ProcessManager.TERMINATED);
                }
            }
            _CPU.isExecuting = false;
        }

        public executeRoundRobin(){
            if (this.counter >=_Quantum){
                if (_ProcessManager.getReadyQueue().getSize() >= 1){
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
                this.resetCounter();
            }
            _CPU.execute();
            this.counter++;
        }

        public executeFCFS(){
            if (this.counter >= Infinity){
                if (_ProcessManager.getReadyQueue().getSize() >= 1){
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
                }
                this.resetCounter();
            }
            _CPU.execute();
            this.counter++;
        }

        //ToDo: Implement a priority queue to reduce overhead
        public executePriority(){
            let currPcb = _ProcessManager.getRunning();
            for (let pcb of _ProcessManager.getReadyQueue().q){
                if (currPcb.getPriority() < pcb.getPriority()) {
                    // Switch context to the higher priority and execute
                    this.forceContextSwitch(pcb);
                    break;
                }
            }
            _CPU.execute();
        }

        public contextSwitch(): ProcessControlBlock{
            let currentPCB: ProcessControlBlock = _ProcessManager.getRunning();
            // Dequeue next PCB and dispatch for scheduling
            let nextPCB: ProcessControlBlock = _ProcessManager.getReadyQueue().dequeue();
            if (currentPCB == undefined) {
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            } else {
                // Save current CPU context in pcb and switch contexts to the next in the ready queue
                _Scheduler.storeToPCB(currentPCB);
                _ProcessManager.getReadyQueue().enqueue(currentPCB.setState("Ready"));
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            }
            return nextPCB;
        }

        public forceContextSwitch(pcb: ProcessControlBlock): ProcessControlBlock{
            let currentPCB: ProcessControlBlock = _ProcessManager.getRunning();
            if (currentPCB == undefined) {
                pcb.setState("Running");
                _Scheduler.storeToCPU(pcb);
            } else {
                // Save current CPU context in pcb and switch contexts to the next in the ready queue
                _Scheduler.storeToPCB(currentPCB);
                _ProcessManager.getReadyQueue().enqueue(currentPCB.setState("Ready"));
                pcb.setState("Running");
                _Scheduler.storeToCPU(pcb);
            }
            return pcb;
        }

        public attemptSwap(runningPcb: ProcessControlBlock): boolean {
            // Check if swap is necessary
            if (runningPcb.getSegment() === _ProcessManager.HARD_DRIVE) {
                let memPCB = _ProcessManager.findProcessInMemory();
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, ["swap", memPCB, runningPcb]));
                return true;
            } else {
                return false;
            }
        }

        public storeToPCB(pcb: ProcessControlBlock){
            // Save current CPU content to PCB
            pcb.pc = _CPU.PC;
            pcb.acc = _CPU.Acc;
            pcb.xReg = _CPU.Xreg;
            pcb.yReg = _CPU.Yreg;
            pcb.zFlag = _CPU.Zflag;
            pcb.segment = _CPU.segment;
        }

        public storeToCPU(pcb: ProcessControlBlock){
            // Save current PCB content to CPU
            _CPU.PC = pcb.pc;
            _CPU.Acc = pcb.acc;
            _CPU.Xreg = pcb.xReg;
            _CPU.Yreg = pcb.yReg;
            _CPU.Zflag = pcb.zFlag;
            _CPU.segment = pcb.segment;
        }

        public resetCounter(){
            this.counter = 0;
        }

        updateQuantum() {
            this.resetCounter();
            this.quantum = _Quantum;
        }
    }
}
