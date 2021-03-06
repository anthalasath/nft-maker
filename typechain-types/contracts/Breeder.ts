/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../common";

export type RequestStruct = {
  contractAddress: string;
  childReceiver: string;
  fatherId: BigNumberish;
  motherId: BigNumberish;
};

export type RequestStructOutput = [string, string, BigNumber, BigNumber] & {
  contractAddress: string;
  childReceiver: string;
  fatherId: BigNumber;
  motherId: BigNumber;
};

export interface BreederInterface extends utils.Interface {
  functions: {
    "breed((address,address,uint256,uint256))": FunctionFragment;
    "payments(address)": FunctionFragment;
    "rawFulfillRandomWords(uint256,uint256[])": FunctionFragment;
    "withdrawPayments(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "breed"
      | "payments"
      | "rawFulfillRandomWords"
      | "withdrawPayments"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "breed",
    values: [RequestStruct]
  ): string;
  encodeFunctionData(functionFragment: "payments", values: [string]): string;
  encodeFunctionData(
    functionFragment: "rawFulfillRandomWords",
    values: [BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawPayments",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "breed", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "payments", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rawFulfillRandomWords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawPayments",
    data: BytesLike
  ): Result;

  events: {
    "BredByBirth(address,uint256)": EventFragment;
    "BreedingStarted(address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BredByBirth"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BreedingStarted"): EventFragment;
}

export interface BredByBirthEventObject {
  contractAddress: string;
  childId: BigNumber;
}
export type BredByBirthEvent = TypedEvent<
  [string, BigNumber],
  BredByBirthEventObject
>;

export type BredByBirthEventFilter = TypedEventFilter<BredByBirthEvent>;

export interface BreedingStartedEventObject {
  contractAddress: string;
  fatherId: BigNumber;
  motherId: BigNumber;
}
export type BreedingStartedEvent = TypedEvent<
  [string, BigNumber, BigNumber],
  BreedingStartedEventObject
>;

export type BreedingStartedEventFilter = TypedEventFilter<BreedingStartedEvent>;

export interface Breeder extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BreederInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    breed(
      request: RequestStruct,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    payments(dest: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    rawFulfillRandomWords(
      requestId: BigNumberish,
      randomWords: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawPayments(
      payee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  breed(
    request: RequestStruct,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  payments(dest: string, overrides?: CallOverrides): Promise<BigNumber>;

  rawFulfillRandomWords(
    requestId: BigNumberish,
    randomWords: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawPayments(
    payee: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    breed(request: RequestStruct, overrides?: CallOverrides): Promise<void>;

    payments(dest: string, overrides?: CallOverrides): Promise<BigNumber>;

    rawFulfillRandomWords(
      requestId: BigNumberish,
      randomWords: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawPayments(payee: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "BredByBirth(address,uint256)"(
      contractAddress?: string | null,
      childId?: BigNumberish | null
    ): BredByBirthEventFilter;
    BredByBirth(
      contractAddress?: string | null,
      childId?: BigNumberish | null
    ): BredByBirthEventFilter;

    "BreedingStarted(address,uint256,uint256)"(
      contractAddress?: string | null,
      fatherId?: BigNumberish | null,
      motherId?: BigNumberish | null
    ): BreedingStartedEventFilter;
    BreedingStarted(
      contractAddress?: string | null,
      fatherId?: BigNumberish | null,
      motherId?: BigNumberish | null
    ): BreedingStartedEventFilter;
  };

  estimateGas: {
    breed(
      request: RequestStruct,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    payments(dest: string, overrides?: CallOverrides): Promise<BigNumber>;

    rawFulfillRandomWords(
      requestId: BigNumberish,
      randomWords: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawPayments(
      payee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    breed(
      request: RequestStruct,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    payments(
      dest: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rawFulfillRandomWords(
      requestId: BigNumberish,
      randomWords: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawPayments(
      payee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
