// Tests for the solidity smart contract - SuppyChain.sol -- and the various functions within

// Declare a variable and assign the compiled smart contract artifact
let SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    let sku = 1;
    let upc = 1;

    const originFarmName = "John Doe";
    const originFarmInformation = "Yarray Valley";
    const originFarmLatitude = "-38.239770";
    const originFarmLongitude = "144.341490";
    let productID = sku + upc;
    const productNotes = "Best beans for Espresso";
    const productPrice = web3.utils.toWei('1', "ether");

    const ownerID = accounts[0];
    const farmerID = accounts[1];
    const distributorID = accounts[2];
    const retailerID = accounts[3];
    const consumerID = accounts[4];

    console.log("ganache-cli accounts used here...");
    console.log("Contract Owner: accounts[0] ", accounts[0]);
    console.log("Farmer: accounts[1] ", accounts[1]);
    console.log("Distributor: accounts[2] ", accounts[2]);
    console.log("Retailer: accounts[3] ", accounts[3]);
    console.log("Consumer: accounts[4] ", accounts[4]);

    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Add a farmer
        await supplyChain.addFarmer(farmerID, {from: ownerID});
        
        // Declare and Initialize a variable for event
        let harvestEventEmitted = false;
        
        // Watch the emitted event Harvested()
        await supplyChain.Harvested((err, res) => harvestEventEmitted = true);

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(
            originFarmName,
            originFarmInformation,
            originFarmLatitude,
            originFarmLongitude,
            productNotes,
            {from: farmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferOne[2], farmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State');
        assert.equal(harvestEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event
        let processedEventEmitted = false;

        // Watch the emitted event Processed()
        await supplyChain.Processed((err, res) => processedEventEmitted = true);

        // Mark an item as Processed by calling function processtItem()
        await supplyChain.processItem(upc, {from: farmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], farmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State');
        assert.equal(processedEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        
        // Declare and Initialize a variable for event
        let packedEventEmitted = false;

        // Watch the emitted event Packed()
        await supplyChain.Packed((err, res) => packedEventEmitted = true);

        // Mark an item as Processed by calling function packItem()
        await supplyChain.packItem(upc, {from: farmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], farmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State');
        assert.equal(packedEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed();
        
        // Declare and Initialize a variable for event
        let forSaleEventEmitted = false;
        
        // Watch the emitted event ForSale()
        await supplyChain.ForSale((err, res) => forSaleEventEmitted = true);

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice, {from: farmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], farmerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State');
        assert.equal(forSaleEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Add a distributor
        await supplyChain.addDistributor(distributorID, {from: ownerID});
        
        // Declare and Initialize a variable for event
        let soldEventEmitted = supplyChain.Sold();
        
        // Watch the emitted event Sold()
        await supplyChain.Sold((err, res) => soldEventEmitted = true);

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.buyItem(upc, {from: distributorID, value: productPrice});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(soldEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Declare and Initialize a variable for event
        let shipEventEmitted = false;
        
        // Watch the emitted event Shipped()
        await supplyChain.Shipped((err, res) => shipEventEmitted = true);

        // Mark an item as Shipped by calling function shipItem()
        await supplyChain.shipItem(upc, {from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(shipEventEmitted, true, 'Invalid event emitted');
    });

    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Add a retailer
        await supplyChain.addRetailer(retailerID, {from: ownerID});
        
        // Declare and Initialize a variable for event
        let receivedEventEmitted = false;
        
        // Watch the emitted event Received()
        await supplyChain.Received((err,res) => receivedEventEmitted = true);

        // Mark an item as Sold by calling function receiveItem()
        await supplyChain.receiveItem(upc, {from: retailerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], retailerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(receivedEventEmitted, true, 'Invalid event emitted');
             
    });

    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Add a consumer
        await supplyChain.addConsumer(consumerID, {from: ownerID});
        
        // Declare and Initialize a variable for event
        let purchasedEventEmitted = false;
        
        // Watch the emitted event Purchased()
        await supplyChain.Purchased((err,res) => purchasedEventEmitted = true);

        // Mark an item as Purchased by calling function purchaseItem()
        await supplyChain.purchaseItem(upc, {from: consumerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID');
        assert.equal(purchasedEventEmitted, true, 'Invalid event emitted');
        
    });

    it("Testing function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
        
        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID');
        assert.equal(resultBufferOne[3], farmerID, 'Error: Missing or Invalid FarmerID');
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName');
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
    });

    it("Testing function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed();

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
        // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU');
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC');
        assert.equal(resultBufferTwo[2], productID, 'Error: Invalid item productID');
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes');
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item Price');
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Missing or Invalid distributorID');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Missing or Invalid retailerID');
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Missing or Invalid consumerID');
    });

});
