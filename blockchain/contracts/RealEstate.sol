// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


contract MyContract {
    // STATE VARIABLES
    struct Property {
        uint256 productId;
        address owner;
        uint256 price;
        string propertyTitle;
        string category;
        string images;
        string propertyAddress;
        string description;
        address[] reviewers;
        string[] reviews;
    }

    // Mapping
    mapping(uint256 => Property) private properties;
    uint256 public propertyIndex;

    // EVENTS
    event PropertyListed(
        uint256 indexed productId,
        address indexed owner,
        uint256 price
    );
    event PropertySold(
        uint256 indexed productId,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );
    event PropertyResold(
        uint256 indexed productId,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );

    // REVIEW Section
    struct Review {
        address reviewer;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
    }

    struct Product {
        uint256 productId;
        uint256 totalRatings;
        uint256 numReviews;
    }

    mapping(uint256 => Review[]) private reviews;
    mapping(address => uint256) private userReviews;
    mapping(uint256 => Product) private products;

    uint256 public reviewsCounter;

    event ReviewAdded(
        uint256 indexed productId,
        address indexed reviewer,
        uint256 rating,
        string comment
    );

    event ReviewLiked(
        uint256 indexed productId,
        uint256 indexed reviewIndex,
        address indexed liker,
        uint256 likes
    );

    // Function in contract
    function listProperty(
        address _owner,
        uint256 _price,
        string memory _propertyTitle,
        string memory _category,
        string memory _images,
        string memory _propertyAddress,
        string memory _description
    ) external returns (uint256) {
        require(_price > 0, "Price must be greater than zero");

        uint256 productId = propertyIndex++;
        Property storage property = properties[productId];

        property.productId = productId;
        property.owner = _owner;
        property.price = _price;
        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;

        emit PropertyListed(productId, _owner, _price);

        return productId;
    }

    function updateProperty(
        address _owner,
        uint256 _productId,
        string memory _propertyTitle,
        string memory _category,
        string memory _images,
        string memory _propertyAddress,
        string memory _description
    ) external returns (uint256) {
        Property storage property = properties[_productId];

        require(property.productId != 0, "Property does not exist");
        require(
            property.owner == _owner,
            "Only the owner can update the property"
        );

        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;

        return _productId;
    }

    function updatePrice(
        address _owner,
        uint256 _productId,
        uint256 _price
    ) external returns (string memory) {
        Property storage property = properties[_productId];

        require(
            property.owner == _owner,
            "Only the owner can update the price"
        );

        property.price = _price;
        return "Price updated successfully";
    }

    function buyProperty(uint256 _id, address _buyer) external payable {
        uint256 amount = msg.value;
        Property storage property = properties[_id];

        require(property.productId != 0, "Property does not exist");
        require(amount >= property.price, "Insufficient funds");
        require(property.owner != _buyer, "Buyer cannot be the owner");

        address oldOwner = property.owner; // ← Eski owner'ı sakla

        (bool sent, ) = payable(oldOwner).call{value: amount}("");
        require(sent, "Failed to send Ether");

        property.owner = _buyer; // ← Transfer başarılıysa owner değiştir
        emit PropertySold(_id, oldOwner, _buyer, amount);
    }

    function getAllProperties() public view returns (Property[] memory) {
        uint256 itemCount = propertyIndex;
        uint256 currentIndex = 0;

        Property[] memory items = new Property[](itemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            Property storage currentItem = properties[i]; // ← i+1 değil, i
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }

        return items;
    }

    function getProperty(
        uint256 id
    )
        external
        view
        returns (
            uint256,
            address,
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        Property memory property = properties[id];

        return (
            property.productId,
            property.owner,
            property.price,
            property.propertyTitle,
            property.category,
            property.images,
            property.propertyAddress,
            property.description
        );
    }

    function getUserProperties(
        address user
    ) external view returns (Property[] memory) {
        uint256 totalItemCount = propertyIndex;
        Property[] memory tempArray = new Property[](totalItemCount);
        uint256 userPropertyCount = 0;

        // Tek loop'ta hem say hem de ekle
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (properties[i].owner == user) {
                tempArray[userPropertyCount] = properties[i];
                userPropertyCount++;
            }
        }

        // Doğru boyutta yeni array oluştur
        Property[] memory userProperties = new Property[](userPropertyCount);
        for (uint256 i = 0; i < userPropertyCount; i++) {
            userProperties[i] = tempArray[i];
        }

        return userProperties;
    }

    // Review functions
    function addReview(
        uint256 productId,
        uint256 rating,
        string calldata comment,
        address user
    ) external {
        require(rating >= 1 && rating <= 5, "Rating musst be between 1 and 5");

        Property storage property = properties[productId];

        property.reviewers.push(user);
        property.reviews.push(comment);

        // Review section
        reviews[productId].push(Review(user, productId, rating, comment, 0));
        userReviews[user]++;
        // userReview[user].push(productId);
        products[productId].totalRatings += rating;
        products[productId].numReviews++;

        emit ReviewAdded(productId, user, rating, comment);
        reviewsCounter++;
    }

    function getProductReviews(
        uint256 productId
    ) external view returns (Review[] memory) {
        return reviews[productId];
    }

    /* 01:13:31 */
    function getUserReviews(
        address user
    ) external view returns (Review[] memory) {
        uint256 totalReviews = userReviews[user]; // ← Sadece sayı
        Review[] memory userProductReviews = new Review[](totalReviews);
        uint256 currentIndex = 0;

        // Tüm property'leri tara
        for (uint256 productId = 0; productId < propertyIndex; productId++) {
            Review[] memory productReviews = reviews[productId];

            for (uint256 j = 0; j < productReviews.length; j++) {
                if (productReviews[j].reviewer == user) {
                    userProductReviews[currentIndex] = productReviews[j];
                    currentIndex++;
                    if (currentIndex >= totalReviews) break;
                }
            }
            if (currentIndex >= totalReviews) break;
        }

        return userProductReviews;
    }

    function likeReview(
        uint256 productId,
        uint256 reviewIndex,
        address liker
    ) external {
        Review storage review = reviews[productId][reviewIndex];

        require(
            review.reviewer != liker,
            "Reviewer cannot like their own review"
        );
        require(review.likes < type(uint256).max, "Maximum likes reached");

        review.likes++;
        emit ReviewLiked(productId, reviewIndex, liker, review.likes);
    }

    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestRating = 0;
        uint256 highestRatedProductId = 0;

        for (uint256 i = 0; i < propertyIndex; i++) {
            if (properties[i].productId != 0 && products[i].numReviews > 0) {
                uint256 averageRating = products[i].totalRatings /
                    products[i].numReviews;
                if (averageRating > highestRating) {
                    highestRating = averageRating;
                    highestRatedProductId = i;
                }
            }
        }

        return highestRatedProductId;
    }

    // Get total reviews count
    function getTotalReviews() external view returns (uint256) {
        return reviewsCounter;
    }
}
