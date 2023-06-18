import { main } from "src";

test("sample", async () => {
  await expect(main()).resolves.not.toThrow();
});
