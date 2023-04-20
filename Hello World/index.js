var {MongoClient} = require('mongodb');

// listing = {
//         name: "Lovely Loft",
//         summary: "A charming loft in Paris",
//         bedrooms: 1,
//         bathrooms: 1
//     }
// multipleListing = [{
//     name: "Room at hotel in Prado",
//     summary: "Beatuiful view",
//     bedrooms: 2,
//     bathrooms: 3
// },{
//     name: "A party club",
//     summary: "Amazing club to hangout with friends",
//     bedrooms: 5,
//     bathrooms: 6
// },{
//     name: "Mansion in Las Vegas",
//     summary: "Stunning Mansion in downtown Las Vegas",
//     bedrooms: 10,
//     bathrooms: 15
// }]

//Connect to the DB


async function main(){
    const uri = "mongodb+srv://angel012912:Niupi700M@cluster0.44hmnak.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try{
        await client.connect();
        await deleteListingsScrapedBeforeDate(client, new Date(2019-02-15));
        // await deleteListingByName(client, "Mansion in Las Vegas");
        // await updateAllListingsToHavePropertyType(client);
        // await upsertListingByName(client, "Cozy Cottage", {name: "Cozy Cottage", bedrooms: 2, bathrooms: 2});
        // await listDatabases(client)
        // await createListing(client, listing);
        // await createMultipleListings(client, multipleListing);
        // await findOneListingByName(client, "Room at hotel in Prado");
        // await findListingsWithMinimumBedrroomsBathroomsandRecentReviews(client, {minBedrooms: 4, minBathrooms: 2, maxRes: 5});
        // await updateListingByName(client, "Lovely Loft", {bedrooms: 6, bathrooms: 6});
    }catch(e){
        console.log(e);
    }finally{
        await client.close();
    }
}

//Check the databases located in my cluster
async function listDatabases(client){
    const dataBasesLists = await client.db().admin().listDatabases();
    console.log("Databases");
    dataBasesLists.databases.forEach(dataBase => {
        console.log(`-${dataBase.name}`);
    });
}

//CRUD Operations

//Create (Insert) One
async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(JSON.stringify(result.insertedId));
}
//Create (Insert) Many
async function createMultipleListings(client, newListings){
    const result =  await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listings created with the following id(s): `);
    console.log(result.insertedIds);
}
//Read (Find) One
async function findOneListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});
    if (result){
        console.log(`Found a name in the listing with the name: ${nameOfListing}`);
        console.log(result);
    }else{
        console.log(`No listing found with the name ${nameOfListing}`);
    }
}
//Read (Find) Many
async function findListingsWithMinimumBedrroomsBathroomsandRecentReviews
(client, {
    minBedrooms = 0,
    minBathrooms = 0,
    maxRes = Number.MAX_SAFE_INTEGER
} = {}){
    const cursor = await client.db("sample_airbnb").collection("listingsAndReviews").find({
            bedrooms: {$gte: minBedrooms},
            bathrooms: {$gte: minBathrooms}
        }).sort({last_review: -1}).limit(maxRes);
    const results = await cursor.toArray();
    if (results.length > 0){
        console.log(`Found Listing(s) with at least ${minBedrooms} bedrooms and ${minBathrooms} bathrooms: `);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${date}`);
        })
    }else{
        console.log(`No Listings found with at least ${minBedrooms} bedrooms and ${minBathrooms} bathrooms`);
    }
}

//Update One
async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {
            name: nameOfListing
        },
        {
            $set: updatedListing
        }
    );
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated `);

}
// Upsert (checks if theres a document that matches the criteria and if not, it insert a document but if there is one it will be updated)
async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        {
            name: nameOfListing
        },
        {
            $set: updatedListing
        },
        {
            upsert: true 
        }
    ); 
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    if(result.upsertedCount > 0){
        console.log(`One document was inserted with the id: ${result.upsertedId}`);
    }else{
        console.log(`${result.modifiedCount} document(s) was/were updated `);
    }
}
//Update Many
async function updateAllListingsToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany(
        {property_type: {$exists: false}},
        {$set: {property_type: "Unknown"}}
    );
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated `);
}

//Delete One
async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}
//Delete many
async function deleteListingsScrapedBeforeDate(client, date){
    result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({
        "last_scraped":{$lt: date}
    });
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}


main().catch(console.error);
