const axios =  require("axios")

class Git {
    gitRepoUrl(org, repo, tag) {
        throw new Error('gitRepoUrl() must be implement')
    }
    getType() {
        throw new Error('getType() must be implement')
    }
    getCloneCommand(org, repo, tag) {
        throw new Error('getCloneCommand() must be implement')
    }
    getHeader() {
        throw new Error('getHeader() must be implement')
    }
    getBranch(org, repo, forkedTag) {
        throw new Error('getBranch() must be implement')
    }
    getRef(org, repo, branch) {
        throw new Error('getRef() must be implement')
    }
    getTags(org, repo, forkedTag) {
        throw new Error('getTags() must be implement')
    }
    createBranch(org, repo, templateBranchData) {
        throw new Error('createBranch() must be implement')
    }
    getReleasedTag(org, repo, tag) {
        throw new Error('getReleasedTag() must be implement')
    }
    createTree() {
        throw new Error('createTree() must be implement')
    }
    getMainRepo(org, repo) {
        throw new Error('getMainRepo() must be implement')
    }
    createRepo(org, repo, userName) {
        throw new Error('createRepo() must be implement')
    }
    getTemplateBranch(org, repo) {
        throw new Error('getTemplateBranch() must be implement')
    }
    getRepo(org, repo) {
        throw new Error('getRepo() must be implement')
    }
    getTemplateURL(repo) {
        throw new Error('getTemplateURL() must be implement')
    }
    getToppingURL(repo) {
        throw new Error('getToppingURL() must be implement')
    }
    setGitList(element, repository, gitRepoUrl) {
        throw new Error('setGitList() must be implement')
    }
    getOrgList() {
        throw new Error('getOrgList() must be implement')
    }
    recursiveTree(element) {
        throw new Error('recursiveTree() must be implement')
    }
    getFile(repo, org, filePath) {
        throw new Error('getFile() must be implement')
    }
    getFiles(options) {
        throw new Error('getFiles() must be implement')
    }
    pushFile(org, repo, data) {
        throw new Error('pushFile() must be implement')
    }
    setPushList(options) {
        throw new Error('setPushList() must be implement')
    }
    getTree(org, repo, sha) {
        throw new Error('getTree() must be implement')
    }
    postTree(org, repo, treeList, treesha) {
        throw new Error('postTree() must be implement')
    }
    getCommit(org, repo, branch) {
        throw new Error('getCommit() must be implement')
    }
    postCommit(org, repo, options) {
        throw new Error('postCommit() must be implement')
    }
    commit(org, repo, branch, treeList, init) {
        throw new Error('commit() must be implement')
    }
    getUrl(org, repo) {
        throw new Error('getUrl() must be implement')
    }
    push(options) {
        throw new Error('push() must be implement')
    }
    patch(org, repo, branch, options) {
        throw new Error('path() must be implement')
    }
    getGitpodUrl(org, repo, releaseTagPath) {
        throw new Error('getGitpodUrl() must be implement')
    }
}

module.exports = Git