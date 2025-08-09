"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const commander_1 = require("commander");
const ethers_1 = require("ethers");
const Comet_json_1 = __importDefault(require("./abi/Comet.json"));
const config_1 = require("./config");
async function main() {
    const env = (0, config_1.loadEnv)();
    const program = new commander_1.Command();
    program.name('comet-cli');
    program
        .command('market')
        .description('Show market info')
        .action(async () => {
        if (!env.COMET_ADDRESS)
            throw new Error('COMET_ADDRESS not set');
        const provider = new ethers_1.JsonRpcProvider(env.RPC_URL);
        const comet = new ethers_1.Contract(env.COMET_ADDRESS, Comet_json_1.default, provider);
        const [name, symbol, decimals, util] = await Promise.all([
            comet.name().catch(() => 'Comet'),
            comet.symbol().catch(() => 'COMET'),
            comet.decimals().catch(() => 18),
            comet.getUtilization().catch(() => 0n)
        ]);
        console.log({ name, symbol, decimals, utilization: (0, ethers_1.formatUnits)(util, 18) });
        const numAssets = Number(await comet.numAssets().catch(() => 0));
        console.log('numAssets:', numAssets);
    });
    program
        .command('account')
        .requiredOption('-a, --address <address>', 'Account address')
        .description('Show account base and borrow balances')
        .action(async (opts) => {
        if (!env.COMET_ADDRESS)
            throw new Error('COMET_ADDRESS not set');
        const provider = new ethers_1.JsonRpcProvider(env.RPC_URL);
        const comet = new ethers_1.Contract(env.COMET_ADDRESS, Comet_json_1.default, provider);
        const decimals = await comet.decimals().catch(() => 18);
        const [base, debt] = await Promise.all([
            comet.balanceOf(opts.address).catch(() => 0n),
            comet.borrowBalanceOf(opts.address).catch(() => 0n)
        ]);
        console.log({ base: (0, ethers_1.formatUnits)(base, decimals), debt: (0, ethers_1.formatUnits)(debt, decimals) });
    });
    await program.parseAsync(process.argv);
}
main().catch((err) => { console.error(err); process.exit(1); });
