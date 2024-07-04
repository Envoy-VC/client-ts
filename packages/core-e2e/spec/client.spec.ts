import {
  initializeNillion,
  NadaValue,
  NadaValues,
  NillionClient,
  Operation,
} from "@nillion/core";
import { Context, loadFixtureContext, strToByteArray } from "../helpers";

describe("Nillion Client", () => {
  let context: Context;

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
    context = await loadFixtureContext();
    expect(context.client).toBeInstanceOf(NillionClient);
  });

  it("gracefully handles multiple calls to initializeNillion()", async () => {
    await initializeNillion();
    await initializeNillion();
    expect(true).toBeTruthy();
  });

  it("derives stable partyId from node key seed", () => {
    const my_party_id = context.client.partyId;
    expect(my_party_id).toBeDefined();

    expect(my_party_id).toEqual(context.test1.partyId);
    context.test1.partyId = my_party_id;
  });

  it("fetches a quote", async () => {
    const values = new NadaValues();
    values.insert("foo", NadaValue.new_secret_integer("1337"));
    values.insert("bar", NadaValue.new_secret_integer("-42"));
    const quote = await context.client.fetchQuote(
      Operation.store_values(values, 1),
    );
    expect(parseInt(quote.cost.total)).toBeGreaterThan(0);
    expect(quote.expires_at.getTime()).toBeGreaterThan(new Date().getTime());
    expect(quote.nonce).toBeTruthy();
  });

  it("stores secret blob and secret integer", async () => {
    const originalInteger = "-42";
    const bytes = strToByteArray(context.test1.input);

    const values = new NadaValues();
    values.insert("blob", NadaValue.new_secret_blob(bytes));
    values.insert("int", NadaValue.new_secret_integer(originalInteger));

    const storeId = await context.client.storeValues(values, 1);

    expect(storeId).not.toBe("");
    context.test1.storeId = storeId;
    context.test1.originalBlob = bytes;
    context.test1.originalInteger = originalInteger;
  });
  //
  // it("should be able to retrieve a blob secret", async () => {
  //   const receipt = await getQuoteThenPay(context, Operation.retrieve_value());
  //   const value = await context.vm.client.retrieveValue(
  //     context.test1.storeId,
  //     "blob",
  //     receipt,
  //   );
  //   expect(value.to_byte_array()).toEqual(context.test1.originalBlob);
  // });
  //
  // it("should be able to retrieve an integer secret", async () => {
  //   const receipt = await getQuoteThenPay(context, Operation.retrieve_value());
  //   const value = await context.vm.client.retrieveValue(
  //     context.test1.storeId,
  //     "int",
  //     receipt,
  //   );
  //   expect(value.to_integer()).toEqual(context.test1.originalInteger);
  // });
  //
  // it("should be able to create a program binding", async () => {
  //   const result = new ProgramBindings(context.test1.programId);
  //   context.test1.programBindings = result;
  //   expect(result).toBeInstanceOf(ProgramBindings);
  // });

  // // The parties of the simple program are
  // // - Dealer
  // // - Result
  // it("should be able to add_input_party to a program binding", async () => {
  //   debugger;
  //   context.test1.programBindings.add_input_party(
  //     "Dealer",
  //     context.test1.partyId,
  //   );
  //   expect(true).toBeTruthy();
  // });
  //
  // it("should be able to add_output_party to a program binding", async () => {
  //   debugger;
  //   context.test1.programBindings.add_output_party(
  //     "Result",
  //     context.test1.programId,
  //   );
  //   expect(true).toBeTruthy();
  // });
  //
  // it("should be able to prep compute inline secrets", async () => {
  //   const computeValues = new NadaValues();
  //   computeValues.insert(
  //     "I00",
  //     NadaValue.new_secret_non_zero_unsigned_integer("17517"),
  //   );
  //   computeValues.insert(
  //     "I01",
  //     NadaValue.new_secret_non_zero_unsigned_integer("5226"),
  //   );
  //   computeValues.insert(
  //     "I02",
  //     NadaValue.new_secret_non_zero_unsigned_integer("15981"),
  //   );
  //   context.test1.computeValues = computeValues;
  //
  //   expect(context.test1.computeValues).toHaveSize(3);
  // });
  //
  // it("should be able to store secrets for compute", async () => {
  //   const values = new NadaValues();
  //   values.insert(
  //     "I03",
  //     NadaValue.new_secret_non_zero_unsigned_integer("2877"),
  //   );
  //   values.insert(
  //     "I04",
  //     NadaValue.new_secret_non_zero_unsigned_integer("2564"),
  //   );
  //   const permissions = new Permissions();
  //   permissions.add_compute_permissions({
  //     [context.vm.client.partyId]: [context.test1.programId],
  //   });
  //   const receipt = await getQuoteThenPay(
  //     context,
  //     Operation.store_values(values, 1),
  //   );
  //   const storeUuid = await context.vm.client.storeValues(
  //     values,
  //     receipt,
  //     permissions,
  //   );
  //   expect(storeUuid).toBeDefined();
  //   context.test1.computeStoreValuesId = storeUuid;
  // });
  //
  // it("should be able to compute program", async () => {
  //   const bindings = new ProgramBindings(context.test1.programId);
  //   bindings.add_input_party("Dealer", context.test1.partyId);
  //   bindings.add_output_party("Result", context.test1.partyId);
  //
  //   const receipt = await getQuoteThenPay(
  //     context,
  //     Operation.compute(context.test1.programId, context.test1.computeValues),
  //   );
  //
  //   const computeResultUuid = await context.vm.client.compute(
  //     bindings,
  //     [context.test1.computeStoreValuesId],
  //     context.test1.computeValues,
  //     receipt,
  //   );
  //
  //   expect(computeResultUuid).not.toBe("");
  //   context.test1.computeId = computeResultUuid;
  // });
  //
  // it("should be able to get a result from compute operation", async () => {
  //   const result = await context.vm.client.getComputeResult(
  //     context.test1.computeId,
  //   );
  //
  //   console.log("Compute result:", result);
  //   expect(result).toBeDefined();
  //   expect(result).not.toBe("");
  //   expect(result).toEqual({
  //     Add0: BigInt(1462969515630),
  //   });
  // });
  //
  // it("should be able to return an array from a computation", async () => {
  //   const programId = `${context.fixtureConfig.programsNamespace}/array_new`;
  //   const bindings = new ProgramBindings(programId);
  //   bindings.add_input_party("Party1", context.test1.partyId);
  //   bindings.add_output_party("Party1", context.test1.partyId);
  //
  //   const values = new NadaValues();
  //   values.insert("I00", NadaValue.new_secret_integer("42"));
  //   values.insert("I01", NadaValue.new_secret_integer("43"));
  //
  //   const receipt = await getQuoteThenPay(
  //     context,
  //     Operation.compute(programId, values),
  //   );
  //   const resultId = await context.vm.client.compute(
  //     bindings,
  //     [],
  //     values,
  //     receipt,
  //   );
  //
  //   const result = await context.vm.client.getComputeResult(resultId);
  //
  //   expect(result).toBeDefined();
  //   expect(result).not.toBe("");
  //   expect(result).toEqual({
  //     my_output: [BigInt(42), BigInt(43)],
  //   });
  // });
  //
  // it("should be able to return a tuple from a computation", async () => {
  //   const programId = `${context.fixtureConfig.programsNamespace}/tuple_new`;
  //   const bindings = new ProgramBindings(programId);
  //   bindings.add_input_party("Party1", context.test1.partyId);
  //   bindings.add_output_party("Party1", context.test1.partyId);
  //
  //   const values = new NadaValues();
  //   values.insert("I00", NadaValue.new_secret_integer("42"));
  //   values.insert("I01", NadaValue.new_secret_integer("43"));
  //
  //   const receipt = await getQuoteThenPay(
  //     context,
  //     Operation.compute(programId, values),
  //   );
  //   const resultId = await context.vm.client.compute(
  //     bindings,
  //     [],
  //     values,
  //     receipt,
  //   );
  //
  //   const result = await context.vm.client.getComputeResult(resultId);
  //
  //   expect(result).toBeDefined();
  //   expect(result).not.toBe("");
  //   expect(result).toEqual({
  //     my_output: [BigInt(42), BigInt(43)],
  //   });
  // });
  //
  // it("should be able to update a secret", async () => {
  //   const values = new NadaValues();
  //   values.insert("another-int", NadaValue.new_secret_integer("1024"));
  //   let receipt = await pay(context, Operation.update_values(values, 1));
  //   await context.vm.client.updateValues(
  //     context.test1.store_id,
  //     values,
  //     receipt,
  //   );
  //
  //   receipt = await pay(context, Operation.retrieve_value());
  //   const secret = await context.vm.client.retrieve_value(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     "another-int",
  //     receipt,
  //   );
  //   expect(secret.to_integer()).toEqual("1024");
  // });
  //
  // it("should be able to store a program", async () => {
  //   const program_fetch = await fetch("__src__/addition_division");
  //   if (!program_fetch.ok) {
  //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   }
  //   const program = await program_fetch.body
  //     ?.getReader()
  //     .read()
  //     .then((onfulfilled) => onfulfilled?.value);
  //
  //   expect(program).toBeDefined();
  //   const receipt = await pay(context, Operation.store_program(program));
  //   const program_id = await context.vm.client.store_program(
  //     context.config.cluster_id,
  //     "addition_division",
  //     program!,
  //     receipt,
  //   );
  //
  //   expect(program_id).toBeDefined();
  // });
  //
  // it("should be able to store the same program twice concurrently", async () => {
  //   const program_fetch = await fetch("__src__/addition_division");
  //   if (!program_fetch.ok) {
  //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   }
  //   const program = await program_fetch.body
  //     ?.getReader()
  //     .read()
  //     .then((onfulfilled) => onfulfilled?.value);
  //
  //   expect(program).toBeDefined();
  //   const receipt1 = await pay(context, Operation.store_program(program));
  //   const receipt2 = await pay(context, Operation.store_program(program));
  //   const promises = [
  //     context.vm.client.store_program(
  //       context.config.cluster_id,
  //       "foo1",
  //       program!,
  //       receipt1,
  //     ),
  //     context.vm.client.store_program(
  //       context.config.cluster_id,
  //       "foo2",
  //       program!,
  //       receipt2,
  //     ),
  //   ];
  //   await Promise.all(promises);
  // });
  //
  // it("should be able to retrieve_permissions", async () => {
  //   const receipt = await pay(context, Operation.retrieve_permissions());
  //   const result = await context.vm.client.retrieve_permissions(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     receipt,
  //   );
  //   expect(result).toBeDefined();
  //   expect(result).toBeInstanceOf(Permissions);
  // });
  //
  // it("should be able to store and delete a secret", async () => {
  //   const values = new NadaValues();
  //   values.insert("I00", NadaValue.new_secret_unsigned_integer("17517"));
  //   values.insert("I01", NadaValue.new_secret_unsigned_integer("5226"));
  //   let receipt = await pay(context, Operation.store_values(values, 1));
  //   const store_id = await context.vm.client.store_values(
  //     context.config.cluster_id,
  //     values,
  //     undefined,
  //     receipt,
  //   );
  //   expect(store_id).toBeDefined();
  //   expect(store_id).not.toBe("");
  //   await context.vm.client.delete_values(context.config.cluster_id, store_id);
  //   receipt = await pay(context, Operation.retrieve_value());
  //   await expectAsync(
  //     context.vm.client.retrieve_value(
  //       context.config.cluster_id,
  //       store_id,
  //       "I00",
  //       receipt,
  //     ),
  //   ).toBeRejectedWithError();
  // });
});
