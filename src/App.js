import github from "./db";
import query from "./Query";
import { useCallback, useEffect, useState } from "react";
import RepoInfo from "./RepoInfo";
import SearchBox from "./SearchBox";
import NavButtons from "./NavButtons";

function App() {
  const [username, setUsername] = useState("");
  const [repoList, setRepoList] = useState(null);
  const [pageCount, setPageCount] = useState(10);
  const [queryString, setQueryString] = useState("app");
  const [totalCount, setTotalCount] = useState("app");

  const [startCursor, setStartCursor] = useState(null);
  const [endCursor, setEndCursor] = useState(null);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [paginationKeyword, setPaginationKeyword] = useState("first");
  const [paginationString, setPaginationString] = useState("");

  const fetchData = useCallback(() => {
    const queryText = JSON.stringify(
      query(pageCount, queryString, paginationKeyword, paginationString)
    );
    fetch(github.baseUrl, {
      method: "post",
      body: queryText,
      headers: github.Headers,
    })
      .then((response) => response.json())
      .then((data) => {
        const viewer = data.data.viewer;
        const repos = data.data.search.edges;
        const total = data.data.search.repositoryCount;

        const start = data.data.search.pageInfo?.startCursor;
        const end = data.data.search.pageInfo?.endCursor;
        const next = data.data.search.pageInfo?.hasNextPage;
        const prev = data.data.search.pageInfo?.hasPreviousPage;

        setUsername(viewer.name);
        setRepoList(repos);
        setTotalCount(total);

        setStartCursor(start);
        setEndCursor(end);
        setHasNextPage(next);
        setHasPreviousPage(prev);

        console.log(data);
      })
      .catch((e) => console.log(e));
  }, [pageCount, queryString, paginationString, paginationKeyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="App container ,mt-5">
      <h1 className="text-primary">
        <i className="bi bi-diagram-2-fill">Repos</i>
      </h1>
      <p>Hey there, {username}</p>
      <SearchBox
        totalCount={totalCount}
        pageCount={pageCount}
        queryString={queryString}
        onQueryChange={(myString) => {
          setQueryString(myString);
        }}
        onTotalChange={(myNumber) => {
          setPageCount(myNumber);
        }}
      />

      <p>
        <b>Search For: {queryString} </b> | <b>Items per page: {pageCount} </b>{" "}
        |<b>Total Results: {totalCount} </b>
      </p>
      <div>
        {repoList && (
          <ul className="list-group list-group-flush">
            {repoList.map((repo) => (
              <RepoInfo key={repo.node.id} repo={repo.node} />
            ))}
          </ul>
        )}
      </div>
      <NavButtons
        start={startCursor}
        end={endCursor}
        next={hasNextPage}
        previous={hasPreviousPage}
        onPage={(myKeyword, myString) => {
          setPaginationKeyword(myKeyword);
          setPaginationString(myString);
        }}
      />
    </div>
  );
}

export default App;
