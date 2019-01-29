# rationale

I am currently using login to retrieve credentials, then scrapper to fetch a list of interest.

I am separating the 2 because I potentially need to debug scrapper without creating new connexions each time (servers of europress have ratelimit, and bm-lyon servers are fragile.)

europresse:
need to make sure the program exits; that it removes png files too.
