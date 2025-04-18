import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GameModule", (m) => {
  const game = m.contract("Game");
  return { game };
});