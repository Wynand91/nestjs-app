export class APIFeatures {
    prismaQuery: any;
    queryString: any;
    searchFields: any;
    extraParams: any;
    query = {}

    constructor(prismaQuery: any, queryString: any, searchFields: any, extraParams: any) {
        this.prismaQuery = prismaQuery;
        this.queryString = queryString;
        this.searchFields = searchFields;
        this.extraParams = extraParams;
    }

    filter() {
        const queryObj = { ...this.queryString };

        // exclude pagination/sorting params - could also use regex to exlude anything that is not 'search'
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((fields) => {
            delete queryObj[fields];
        });
        
        // queryObj = { search: 'api' }
        // update the query with filtered query
        const searchParams = {}
        if (queryObj['search']) {
            for (let i = 0; i < this.searchFields.length; i++) {
                searchParams[this.searchFields[i]] = {
                    contains: queryObj['search'],
                    mode: 'insensitive',
                }
            }
        }
        
        this.query['where'] = {
            ...this.extraParams,
            ...searchParams
        }

        return this;
    }

    sorting() {
        const sortQuery = this.queryString.sortBy
        
        if (sortQuery) {
            const sortObj = {}
            const sortBy = sortQuery.split('.');
            const field = sortBy[0];
            const order = sortBy[1];
            sortObj[field] = order
            this.query['orderBy'] = sortObj
        }
    
        return this;
      }

    pagination() {
        // get the page and convert it to a number. If no page set default to 1
        const page = this.queryString.page * 1 || 1;
    
        // get limit and if no limit, set limit to 100
        const limit = this.queryString.limit * 1 || 100;
        // calculate skip value
        const skip = (page - 1) * limit;
    
        // chain to the query object.
        this.query['skip'] = skip
        this.query['take'] = limit

        return this;
      }

    execute () {
        this.filter();
        this.sorting();
        this.pagination();
        this.prismaQuery = this.prismaQuery.findMany(this.query);
    }
}