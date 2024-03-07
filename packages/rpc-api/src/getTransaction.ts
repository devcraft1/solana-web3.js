import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Blockhash,
    Commitment,
    LamportsUnsafeBeyond2Pow53Minus1,
    Reward,
    Slot,
    TokenBalance,
    TransactionError,
    TransactionStatus,
    U64UnsafeBeyond2Pow53Minus1,
    UnixTimestamp,
} from '@solana/rpc-types';
import type { TransactionVersion } from '@solana/transactions';

type ReturnData = {
    /** the return data itself */
    data: Base64EncodedDataResponse;
    /** the program that generated the return data */
    programId: Address;
};

type TransactionMetaBase = Readonly<{
    /** number of compute units consumed by the transaction */
    computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
    /** Error if transaction failed, null if transaction succeeded. */
    err: TransactionError | null;
    /** fee this transaction was charged */
    fee: LamportsUnsafeBeyond2Pow53Minus1;
    /** array of string log messages or null if log message recording was not enabled during this transaction */
    logMessages: readonly string[] | null;
    /** array of account balances after the transaction was processed */
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** List of token balances from after the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    postTokenBalances?: readonly TokenBalance[];
    /** array of account balances from before the transaction was processed */
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** List of token balances from before the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    preTokenBalances?: readonly TokenBalance[];
    /** the most-recent return data generated by an instruction in the transaction */
    returnData?: ReturnData;
    /** transaction-level rewards */
    rewards: readonly Reward[] | null;
    /**
     * Transaction status
     * @deprecated
     */
    status: TransactionStatus;
}>;

type AddressTableLookup = Readonly<{
    /** public key for an address lookup table account. */
    accountKey: Address;
    /** List of indices used to load addresses of readonly accounts from a lookup table. */
    readableIndexes: readonly number[];
    /** List of indices used to load addresses of writable accounts from a lookup table. */
    writableIndexes: readonly number[];
}>;

type TransactionBase = Readonly<{
    message: {
        recentBlockhash: Blockhash;
    };
    signatures: readonly Base58EncodedBytes[];
}>;

type TransactionInstruction = Readonly<{
    accounts: readonly number[];
    data: Base58EncodedBytes;
    programIdIndex: number;
}>;

type TransactionJson = Readonly<{
    message: {
        accountKeys: readonly Address[];
        header: {
            numReadonlySignedAccounts: number;
            numReadonlyUnsignedAccounts: number;
            numRequiredSignatures: number;
        };
        instructions: readonly TransactionInstruction[];
    };
}> &
    TransactionBase;

type PartiallyDecodedTransactionInstruction = Readonly<{
    accounts: readonly Address[];
    data: Base58EncodedBytes;
    programId: Address;
}>;

type ParsedTransactionInstruction = Readonly<{
    parsed: {
        info?: object;
        type: string;
    };
    program: string;
    programId: Address;
}>;

type TransactionJsonParsed = Readonly<{
    message: {
        accountKeys: [
            {
                pubkey: Address;
                signer: boolean;
                source: string;
                writable: boolean;
            },
        ];
        instructions: readonly (ParsedTransactionInstruction | PartiallyDecodedTransactionInstruction)[];
    };
}> &
    TransactionBase;

type GetTransactionCommonConfig<TMaxSupportedTransactionVersion> = Readonly<{
    commitment?: Commitment;
    maxSupportedTransactionVersion?: TMaxSupportedTransactionVersion;
}>;

type GetTransactionApiResponseBase = Readonly<{
    /** estimated production time of when the transaction was processed. null if not available */
    blockTime: UnixTimestamp | null;
    /** the slot this transaction was processed in */
    slot: Slot;
}>;

type TransactionMetaLoadedAddresses = Readonly<{
    loadedAddresses: {
        readonly: readonly Address[];
        writable: readonly Address[];
    };
}>;

type InnerInstructions<TInstructionType> = Readonly<{
    index: number;
    instructions: readonly TInstructionType[];
}>;

type TransactionMetaInnerInstructionsNotParsed = Readonly<{
    innerInstructions?: readonly InnerInstructions<TransactionInstruction>[] | null;
}>;

type TransactionMetaInnerInstructionsParsed = Readonly<{
    innerInstructions?:
        | readonly InnerInstructions<ParsedTransactionInstruction | PartiallyDecodedTransactionInstruction>[]
        | null;
}>;

type TransactionAddressTableLookups = Readonly<{
    message: Readonly<{
        addressTableLookups: readonly AddressTableLookup[];
    }>;
}>;

export interface GetTransactionApi extends RpcApiMethods {
    /**
     * Returns transaction details for a confirmed transaction
     */
    getTransaction<TMaxSupportedTransactionVersion extends TransactionVersion | void = void>(
        signature: Signature,
        config: GetTransactionCommonConfig<TMaxSupportedTransactionVersion> &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ):
        | (GetTransactionApiResponseBase &
              (TMaxSupportedTransactionVersion extends void
                  ? Record<string, never>
                  : { version: TransactionVersion }) & {
                  meta: (TransactionMetaBase & TransactionMetaInnerInstructionsParsed) | null;
                  transaction: TransactionJsonParsed &
                      (TMaxSupportedTransactionVersion extends void
                          ? Record<string, never>
                          : TransactionAddressTableLookups);
              })
        | null;
    getTransaction<TMaxSupportedTransactionVersion extends TransactionVersion | void = void>(
        signature: Signature,
        config: GetTransactionCommonConfig<TMaxSupportedTransactionVersion> &
            Readonly<{
                encoding: 'base64';
            }>,
    ):
        | (GetTransactionApiResponseBase &
              (TMaxSupportedTransactionVersion extends void
                  ? Record<string, never>
                  : { version: TransactionVersion }) & {
                  meta:
                      | (TransactionMetaBase &
                            TransactionMetaInnerInstructionsNotParsed &
                            (TMaxSupportedTransactionVersion extends void
                                ? Record<string, never>
                                : TransactionMetaLoadedAddresses))
                      | null;
                  transaction: Base64EncodedDataResponse;
              })
        | null;
    getTransaction<TMaxSupportedTransactionVersion extends TransactionVersion | void = void>(
        signature: Signature,
        config: GetTransactionCommonConfig<TMaxSupportedTransactionVersion> &
            Readonly<{
                encoding: 'base58';
            }>,
    ):
        | (GetTransactionApiResponseBase &
              (TMaxSupportedTransactionVersion extends void
                  ? Record<string, never>
                  : { version: TransactionVersion }) & {
                  meta:
                      | (TransactionMetaBase &
                            TransactionMetaInnerInstructionsNotParsed &
                            (TMaxSupportedTransactionVersion extends void
                                ? Record<string, never>
                                : TransactionMetaLoadedAddresses))
                      | null;
                  transaction: Base58EncodedDataResponse;
              })
        | null;
    getTransaction<TMaxSupportedTransactionVersion extends TransactionVersion | void = void>(
        signature: Signature,
        config?: GetTransactionCommonConfig<TMaxSupportedTransactionVersion> &
            Readonly<{
                encoding?: 'json';
            }>,
    ):
        | (GetTransactionApiResponseBase &
              (TMaxSupportedTransactionVersion extends void
                  ? Record<string, never>
                  : { version: TransactionVersion }) & {
                  meta:
                      | (TransactionMetaBase &
                            TransactionMetaInnerInstructionsNotParsed &
                            (TMaxSupportedTransactionVersion extends void
                                ? Record<string, never>
                                : TransactionMetaLoadedAddresses))
                      | null;
                  transaction: TransactionJson &
                      (TMaxSupportedTransactionVersion extends void
                          ? Record<string, never>
                          : TransactionAddressTableLookups);
              })
        | null;
}
