let date = new Date();

exports.humans = [{
    id: 0,
    name: "Alice"
  }, {
    id: 1,
    name: "Bob"
  }, {
    id: 2,
    name: "Emil"
  }]
  
  exports.pets = [{
    id: 0,
    humanId: 1,
    name: "Catty"
  }]

  exports.blogPost = [{
    postID: 0,
    postHeader: "Welcome",
    postText: "sklfjlksjdfkkdfljldfjölkajklsdfjlkjfj",
    postDate: date.toDateString()
  }, {
    postID: 1,
    postHeader: "SecondPost",
    postText: "fjsjdlflkadjfkljsljflkjsaöklfjklsadfklslödfj",
    postDate: date.toDateString()
  }, {
    postID: 2,
    postHeader: "Fuck u",
    postText: "sjdfölsdklfjoiuioewgoiewigjioewjiogweghowehgwegh",
    postDate: date.toDateString()
  }]

  exports.projects = [{
    name: "emilpersson.com",
    description: "This website",
    link: "https://github.com/RandomNoob724/RandomNoob724"
}]