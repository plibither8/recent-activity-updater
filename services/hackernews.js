const fetch = require("node-fetch");

const getFaves = async (comments) => {
  const url = `https://hn-faves.mihir.ch/plibither8/${
    comments ? "comments" : "stories"
  }`;
  const res = await fetch(url);
  return res.json();
};

// Main function
module.exports = async function (gist) {
  const oldFaves = gist.hackernews ?? [];
  const comments = await getFaves(true);
  const stories = await getFaves(false);
  const currentFaveIds = [...stories, ...comments];
  console.log("done: hacker news faves", currentFaveIds.length);

  // Remove _removed_ favorited items
  const currentList = oldFaves.filter((item1) =>
    currentFaveIds.find((item2) => item1.id === item2.id)
  );
  const addedItems = currentFaveIds.filter(
    (item1) => !oldFaves.find((item2) => item1.id === item2.id)
  );

  const delta = {
    added: addedItems.length,
    removed: oldFaves.length - currentList.length,
  };

  // number of items removed + added
  console.log("hn faves delta:", delta.added + delta.removed);

  const HN_API_URL = "http://hn.algolia.com/api/v1/items";

  let count = 1;
  for (const [index, item] of addedItems.entries()) {
    await new Promise((r) => setTimeout(r, 10));
    const details = await fetch(`${HN_API_URL}/${item.id}`).then((res) =>
      res.json()
    );
    addedItems[index] = {
      id: details.id,
      link: details.url || "https://news.ycombinator.com/item?id=" + details.id,
      time: details.created_at_i * 1000,
      text: details.text,
      type: details.type,
      title: details.title,
    };
    console.log(`done item: ${count++} / ${addedItems.length}`);
  }
  console.log("done: hacker news fave dates");

  const updatedFaves = [...currentList, ...addedItems];

  // sort comments and stories by time
  updatedFaves.sort((a, b) => (a.time < b.time ? 1 : -1));

  return updatedFaves;
};
