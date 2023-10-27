const Git =  require("./Git")
const axios =  require("axios")
class Gitlab extends Git {
    getOrigin() {
        return window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
    }
    getType() {
        return "GitLab"
    }

    getCloneCommand(org, repo) {
        return `git clone https://gitlab.${this.getOrigin()}/${org}/${repo}.git`
    }

    gitRepoUrl(org, repo) {
        return `https://gitlab.${this.getOrigin()}/${org}/${repo}`
    }
    getHeader() {
        return {
            Authorization: 'Bearer ' + localStorage.getItem("gitToken"),
            Accept: 'application/json'
        }
    }
    getUser() {
        let me = this
        return new Promise(async function (resolve, reject) {
            let userName = localStorage.getItem('gitUserName')
            let getUserInfo = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/users?username=${userName}`, {headers: me.getHeader()})
            .then(function (res) {
                resolve(res.data[0])
            })
            .catch(e => reject(e))
        })
    }
    getRepoId(repo) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let userInfo = me.getUser()
            .then(async function (info) {
                const result = axios.get(`https://gitlab.${me.getOrigin()}/api/v4/users/${info.id}/projects`, {headers: me.getHeader()})
                .then((res) => {
                    for(const repoInfo in res.data) {
                        console.log(res.data[repoInfo].name, repo)
                        if(res.data[repoInfo].name == repo) {
                            resolve(res.data[repoInfo])
                        }
                    }
                    // console.log("*****")
                    resolve({id:null})
                })
                .catch(e => reject(e))
            })
            .catch(error => reject(error))
        })
    }
    createRepo(org, repo, userName) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let newProjectData = {
                name: repo,
                description: repo,
                path: repo,
                visibility: "public",
                initialize_with_readme: "false"
            }
            var createProjectRes = await axios.post(`https://gitlab.${me.getOrigin()}/api/v4/projects`, newProjectData, {headers: me.getHeader()})
            .then((res) => {
                resolve()
            })
            .catch(e => {
                reject(e)
            })
        })
    }
    getRepo() {
        let me = this
        return new Promise(async function (resolve, reject) {

        })
    }
    // getRepoFiles(options) {

    // }
    getFiles(options) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let result = []
            let repoInfo = me.getRepoId(options.repo)
            .then(async function (info) {
                let firstPage = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/tree?ref=${options.name}&id=${info.id}&page=1&per_page=100&recursive=true`, {headers: me.getHeader()})
                .then(async function (firstRes) {
                    result = result.concat(firstRes.data)
                    // resolve(res.data)
                    let totalPages = parseInt(firstRes.headers['x-total-pages'])
                    for (var i = 2; i <= totalPages; i++) {
                        let otherPages = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/tree?ref=${options.name}&id=${info.id}&page=${i}&per_page=100&recursive=true`, {headers: me.getHeader()})
                        .then(function (otherRes) {
                            result = result.concat(otherRes.data)
                            if(totalPages == i) {
                                resolve(result)
                            }
                        })
                        .catch(e => reject(e))
                    }

                })
                .catch(error => (reject(error)))
            })
        })
    }
    setPushList(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let gitlabFilePathList = []
            let removeTree = []
            var isChanged = false
            let pushTree = []      
            
            for(const data of options.gitTree) {
                if(data.type == "blob"){
                    gitlabFilePathList.push(data.path)
                }
            }
            
            gitlabFilePathList.forEach(function (elData) {
                if(!options.generateCodeLists.find(element => element.fullPath == elData)){
                    var action = {
                        action: "delete",
                        file_path: elData,
                    }
                    removeTree.push(action)
                }
            })

            options.generateCodeLists.forEach(function (elData) {
                if(!gitlabFilePathList.find(element => element == elData.fullPath)) {
                    var code
                    if(elData.code){
                        code = elData.code
                    }

                    if(!code){
                        code = 'undefined'
                    }
                    var action = {
                        action: "create",
                        file_path: elData.fullPath,
                        content: code,
                        force: true
                    }
                    pushTree.push(action)
                } 
                // else if(!me.isNewProject && ((options.copyChangedPathLists && options.copyChangedPathLists.find(element => element.replace("for-model/","") == elData.fullPath)) || me.pushType != "Push")){
                else {
                    var code
                    if(elData.code){
                        code = elData.code
                    }

                    if(!code){
                        code = 'undefined'
                    }
                    var action = {
                        action: "update",
                        file_path: elData.fullPath,
                        content: code
                    }
                    pushTree.push(action)
                }
            })
            // console.log(me.gitLabCommitAction)

            var setCommitActionList
            pushTree.reduce(function(acc, current) {
                if (acc.findIndex(({ file_path }) => file_path === current.file_path) === -1) {
                    acc.push(current);
                }
                setCommitActionList = acc
                // console.log(acc)
                return acc;
            }, []);

            resolve(setCommitActionList);
        })
    }
    commit(org, repo, branch, treeList, init) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            resolve(true)
        })
    }
    push(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let commitData = {
                branch: options.branch,
                commit_message: "commit",
                actions: options.list,
            }
            let userInfo = me.getRepoId(options.repo)
            .then(async function (info) {
                var pushtoMain = await axios.post(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/commits`, commitData, { headers: me.getHeader() })
                .then(async (res) => {
                    let templateBranch = await me.getTemplateBranch(options.org, options.repo)
                    .then(() => {
                        // res.data.tree = true
                        resolve(res)
                    })
                    .catch(async error => {
                        if (error.response.status === 404) {
                            let createBranch = await me.createBranch(options.org, options.repo, "template")
                            .then(async (result) => {
                                // let commitTemplateData = {
                                //     branch: "template",
                                //     commit_message: "commit",
                                //     actions: options.list
                                // }
                                // var pushtoTemplate = await axios.post(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/commits`, commitTemplateData, { headers: me.getHeader() })
                                // .then(function() {
                                    // res.data.tree = true
                                    resolve(res)
                                // })
                                // .catch(e => {
                                //     reject(e)
                                // })
                            })
                            .catch(e => reject(e))
                        }
                    })
                    // resolve(res)
                })
                .catch(e => reject(e))
            })
            .catch(e => reject(e))
            
            
        })
    }
    createBranch(org, repo, branch) {
        let me = this 
        return new Promise(async function (resolve, reject) {
            let userInfo = me.getRepoId(repo)
            .then(async function(info) {
                let templateBranch = await axios.post(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/branches?branch=${branch}&ref=main`, {}, { headers: me.getHeader() })
                .then((res) => {
                    resolve(res)
                })
            })
            .catch(e => reject(e))
            
            .catch(e => reject(e))
        })
    }

    getMainRepo(org, repo) {
        let me = this
        return new Promise(async function (resolve,reject) {
            let userInfo = me.getRepoId(repo)
            .then(async function (info) {
                const result = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/branches/main`, {headers: me.getHeader()})
                .then((res) => {
                    resolve(res)
                })
                .catch(e => reject(e))
            })
            .catch(error => reject(error))
        })
    }
    getTemplateBranch(org, repo) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let userInfo = me.getRepoId(repo)
            .then(async function (info) {
                const result = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/branches/template`, {headers: me.getHeader()})
                .then((res) => {
                    res.data.tree = true
                    resolve(res)
                })
                .catch(e => reject(e))
            })
            .catch(error => reject(error))
        })
    }
    getOrgList() {
        let me = this
        return new Promise(async function (resolve, reject) {
            const result = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/groups`, {headers: me.getHeader()})
            .then(async (res) => {
                let result = {
                    gitlabGroupIdList : [],
                    gitOrganizations: []
                }

                if(res && res.data.length > 0){
                    await Promise.all(res.data.map(function (orgInfo) {
                        result.gitlabGroupIdList[orgInfo.name] = orgInfo.id
                        result.gitOrganizations.push(orgInfo.name)
                    }))
                    
                    resolve(gitOrganizations)
                }
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
}

module.exports = Gitlab