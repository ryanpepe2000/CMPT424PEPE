/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

        }

        public execute(): void{

        }

        public getAcc(): number {
            return this.Acc;
        }

        public setAcc(num: number): void {
            this.Acc = num;
            // Move this elsewhere
            $("#cpu-acc").html(Utils.decToHex(this.Acc).toUpperCase());
        }

        public getXReg(): number {
            return this.Xreg;
        }

        public setXReg(num: number) {
            this.Xreg = num;
            $("#cpu-x").html(Utils.decToHex(this.Xreg).toUpperCase());
        }

        public getYReg(): number {
            return this.Yreg;
        }

        public setYReg(num: number) {
            this.Yreg = num;
            $("#cpu-y").html(Utils.decToHex(this.Yreg).toUpperCase());
        }

        public getZFlag(): number {
            return this.Zflag;
        }

        public enableZFlag() {
            this.Zflag = 1;
            $("#cpu-z").html(Utils.decToHex(this.Zflag));
        }

        public disableZFlag() {
            this.Zflag = 0;
            $("#cpu-z").html(Utils.decToHex(this.Zflag));
        }
    }
}
