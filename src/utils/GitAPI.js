class GitAPI {
    constructor(type) {
        this._git = type;
    }

    getType() {
        return this._git.getType()
    }
    getCloneCommand(org, repo) {
        return this._git.getCloneCommand(org, repo)
    }
    gitRepoUrl(org, repo, tag) {
        return this._git.gitRepoUrl(org, repo, tag)
    }

    getBranch(org, repo, forkedTag) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getBranch(org, repo, forkedTag)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    getTags(org, repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getTags(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    createBranch(org, repo) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.createBranch(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getReleasedTag(org, repo, tag) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.getReleasedTag(org, repo, tag)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getMainRepo(org, repo) {
        let me = this;
        return new Promise(async function(resolve, reject) {
            const result = await me._git.getMainRepo(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    createRepo(org, repo, userName) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.createRepo(org, repo, userName)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getTemplateBranch(org, repo) {
        let me = this;
        return new Promise(async function(resolve, reject) {
            const result = await me._git.getTemplateBranch(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getRepo(org, repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getRepo(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getOrgList() {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getOrgList()
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    startCommit() {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.startCommit()
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getFiles(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getFiles(options)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    /**
     * 
     * @param { gitTree: Array<>, generateCodeLists: Array<>, copyChangedPathLists: Array<>, pushType: string, bcCnt: number, onlyOneBcId: string } options 
     * @returns 
     */
    setPushList(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.setPushList(options)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getUrl(org, repo) {
        return this._git.getUrl(org, repo)
    }
    commit(org, repo, branch, list, init) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.commit(org, repo, branch, list, init)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    push(org, repo, list, init) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.push(org, repo, list, init)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

    postTree(org, repo, treeList, treesha) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let tree = await me._git.postTree(org, repo, treeList, treesha)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

    startCommitTemplate() {
        
    }

}
module.exports = GitAPI