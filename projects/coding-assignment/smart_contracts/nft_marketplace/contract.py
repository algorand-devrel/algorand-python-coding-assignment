# pyright: reportMissingModuleSource=false
from algopy import *

"""
This simple NftMarketplace app is a smart contract that allows the sale of assets (ASA).

The lifecycle of this app is as follows:

The app creator (seller) creates the app.
The app creator (seller) bootstraps the app by calling the bootstrap method. At this time, 
the app sets the asset (ASA) to be sold, sets the unit price, and opts the app account into 
the asset to be sold.
A buyer purchases the asset (ASA) being sold by calling the buy method.
The app creator (seller) calls the withdraw_and_delete method to transfer the remaining 
assets (ASA) in the app account to the seller's account, transfer all proceeds to the seller's 
account, and then delete the smart contract.
"""


class NftMarketplace(arc4.ARC4Contract):
    """
    Problem 1
    Define and initialize the state of the NftMarketplace app.

    The NftMarketplace app has three states:

    asset_id: The ID of the asset (ASA) to be sold; a UInt64 type global state with an initial value set to 0.
    unitary_price: The price of the asset (ASA) to be sold; a UInt64 type global state with an initial value set to 0.
    bootstrapped: A bool type global state that checks if the app is ready to sell the asset. The initial value is set to False. This changes to True when the bootstrap method is executed.
    
    Fun Fact!
    The Algorand Virtual Machine (AVM) only supports Bytes and UInt64 types. Therefore, if you want to use other types, 
    you usually use the ARC4 type. However, in Algorand Python, you can use bool and string types as you would in Python code. 
    For example, the bool type can be expressed as True or False, and the string type can be expressed as "Hello, World!". 
    For more information on how to use data types in Algorand Python, refer to the link below:
    - ARC4 types: https://algorandfoundation.github.io/puya/lg-types.html#types

    Tip!
    When defining Global State, using a simplified version allows you to define the state and set initial values with concise code. 
    For more details, refer to Hint 1 below.
    Hint 1 - Global State: https://algorandfoundation.github.io/puya/lg-storage.html#global-storage
    Hint 2 - Code Example: https://github.com/algorandfoundation/puya/blob/11843f6bc4bb6e4c56ac53e3980f74df69d07397/examples/global_state/contract.py#L5
    """

    def __init__(self) -> None:
        "Problem 1 Start"
        self.asset_id = "Write code here"
        self.unitary_price = "Write code here"
        self.bootstrapped = "Write code here"
        "Problem 1 End"

    """
    Problem 2
    Implement the bootstrap method.

    The bootstrap method sets the asset (ASA) to be sold, sets the unit price, and opts the app account into the asset to be sold. 
    In other words, this method prepares the app for selling.

    Function Arguments Explained:
    - asset: An argument of type Asset that contains information about the asset (ASA) to be sold.
    - unitary_price: An argument of type UInt64 that represents the unit price of the asset (ASA) to be sold.
    - mbr_pay: A payment transaction that is atomically grouped and sent simultaneously to the app account. This transaction ensures the app's minimum balance is met.
    
    Step 1: Check bootstrap call conditions with assert
    - Verify that the method caller (Txn.sender) is the app creator (Global.creator_address).
    - Verify that the bootstrapped global state is False.
    - Verify that the receiver of the mbr_pay transaction is the app account.
    - Verify that the amount of mbr_pay equals the sum of the minimum balance for the app account (0.1 ALGO) and the minimum balance required to opt into the asset (0.1 ALGO).
    
    Step 2: Implement following bootstrap operations
    - Update the `asset_id` global state with the asset ID of the ASA to be sold.
    - Update the `unitary_price` global state with the unit price of the ASA to be sold.
    - Set the `bootstrapped` global state to True.
    - Opt the app account into the asset to be sold using an inner transaction.
      Since the transaction is being sent by the app account, you need to use an Inner Transaction. For more details, refer to Hint 2. 
      To opt into an asset, you need to send a special assetTransfer transaction where you send 0 units of the asset to your own account. 
      In other words, implement an inner txn where the app account sends 0 units of the asset to itself.
      -> Among the arguments for AssetTransfer, the mandatory fields to set are xfer_asset (the ID of the asset to transfer), asset_receiver (the receiving account), and asset_amount (the amount of the asset to transfer).
    
    Hint 1 - Global Opcode: https://algorandfoundation.github.io/puya/api-algopy.html#algopy.Global
    Hint 2 - How to Inner Transaction: https://algorandfoundation.github.io/puya/lg-transactions.html#inner-transactions
    Hint 3 - Asset Transfer Inner Txn: https://algorandfoundation.github.io/puya/api-algopy.itxn.html#algopy.itxn.AssetTransfer
    Hint 4 - itxn asset transfer code example: https://github.com/algorandfoundation/puya/blob/2acea25a96c0acd818e9410007d473b2a82e754d/examples/amm/contract.py#L357
    """

    "Problem 2 Start"

    @arc4.abimethod
    def bootstrap(
        self, asset: Asset, unitary_price: UInt64, mbr_pay: gtxn.PaymentTransaction
    ) -> None:
        "Write code here"

    "Problem 2 End"

    """
    Problem 3
    Implement the buy method.

    The buy method is called by a buyer to purchase assets (ASA) from the app. The buyer sends money, and the smart contract transfers 
    the asset (ASA) to the buyer.

    Method Arguments Explained:
    - buyer_txn: A payment transaction that is atomically grouped and sent simultaneously to the app account. This transaction is sent by 
                 the buyer to send Algos for purchasing the asset.
    - quantity: An argument of type UInt64 that represents the number of assets (ASA) the buyer wants to purchase.
    
    Implementation Steps:
    Step 1: Check buy method call conditions with assert
    - Verify that the `bootstrapped` global state is True. If False, the app is not bootstrapped.
    - Verify that the sender of buyer_txn is the same as Txn.sender. This ensures that the account calling the buy method is the same as the account sending the payment transaction.
    - Verify that the receiver of buyer_txn is the app account address. This ensures that the account calling the buy method is paying the app account and not a different account.
    - Verify that the amount in buyer_txn equals the unitary_price multiplied by quantity. This ensures that the buyer is paying the correct amount.
    
    Step 2: Implement following buy method operations
    - Transfer the asset (ASA) to the buyer. The quantity of the asset to transfer is the value of the quantity argument. 
      This transaction is be sent by the app account, so use an Inner Transaction.

    Hint 1 - Inner Transaction: https://algorandfoundation.github.io/puya/lg-transactions.html#inner-transactions
    Hint 2 - Asset Transfer Inner Txn: https://algorandfoundation.github.io/puya/api-algopy.itxn.html#algopy.itxn.AssetTransfer
    Hint 3 - itxn asset transfer code example: https://github.com/algorandfoundation/puya/blob/2acea25a96c0acd818e9410007d473b2a82e754d/examples/amm/contract.py#L357
    """

    "Problem 3 Start"
    @arc4.abimethod
    def buy(
        self,
        buyer_txn: gtxn.PaymentTransaction,
        quantity: UInt64,
    ) -> None:
        "Write code here"
    "Problem 3 End"

    """
    Problem 4
    Implement the withdraw_and_delete method.

    The withdraw_and_delete method transfers remaining assets (ASA) in the app account to the creator account, 
    sends all proceeds to the seller's account, and deletes the smart contract.

    The withdraw_and_delete method has an OnComplete action of DeleteApplication. This means that after this method is executed, 
    the smart contract will be deleted. Therefore, the decorator is set with allow_actions=["DeleteApplication"].

    Hint - Decorator: https://algorandfoundation.github.io/puya/lg-arc4.html#:~:text=%40arc4.abimethod(create%3DFalse%2C%20allow_actions%3D%5B%22NoOp%22%2C%20%22OptIn%22%5D%2C%20name%3D%22external_name%22)

    Implementation Steps:
    Step 1: Check conditions for calling withdraw_and_delete using assert
    - Verify that the method caller (Txn.sender) is the app creator (Global.creator_address).
    
    Step 2: Implement the following withdraw_and_delete method operations:
    1. Transfer all assets (ASA) from the app account to the creator account. (AssetTransfer Transaction)
       Set the asset_close_to parameter to the creator (seller) to transfer all remaining ASA from the app account to the creator (seller).
       Since all remaining assets are transferred regardless of quantity, you do not need to specify the asset quantity (asset_amount).
    -> parameters to be configured:
    - xfer_asset: ID of the ASA in the app account
    - asset_receiver: Address to receive the asset transfer
    - asset_close_to: Address where the entire amount is transferred

    2. Transfer all proceeds from the app account to the creator (seller) account. (Payment Transaction)
       Set the close_remainder_to parameter to the creator (seller) to send the entire balance (including the minimum balance) 
       to the creator (seller). Since close_remainder_to is configured, you do not need to set the amount because the entire balance 
       will be transferred.
    -> parameters to be configured:
    - receiver: Address to receive the Algos
    - close_remainder_to: Address where the entire balance is transferred

    Both transactions are initiated by the app account, so use Inner Transactions!

    Hint 1 - Inner Transaction: https://algorandfoundation.github.io/puya/lg-transactions.html#inner-transactions
    Hint 2 - itxn asset transfer code example: https://github.com/algorandfoundation/puya/blob/2acea25a96c0acd818e9410007d473b2a82e754d/examples/amm/contract.py#L357
    """

    "Problem 4 Start"

    @arc4.abimethod(allow_actions=["DeleteApplication"])
    def withdraw_and_delete(self) -> None:
        "Write code here"

    "Problem 4 End"
