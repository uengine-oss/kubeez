const Git =  require("./Git")
const axios =  require("axios")
class Gitlab extends Git {
    getOrigin() {
        return window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
    }
    getType() {
        return "GitLab"
    }
    getGitpodUrl(org, repo, releaseTagPath) {
        // https://gitlab.handymes.com/kimsanghoon/shop/-/tree/main/
        return `https://gitpod.${this.getOrigin()}/#https://gitlab.${this.getOrigin()}/${org}/${repo}/-/tree/main/`
    }
    getCloneCommand(org, repo, tag) {
        return `git clone https://gitlab.${this.getOrigin()}/${org}/${repo}.git${tag}`
    }

    gitRepoUrl(org, repo) {
        return `https://gitlab.${this.getOrigin()}/${org}/${repo}`
    }
    getTemplateURL(repo) {
        let me = this;
        return new Promise((resolve, reject) => {
            let result = `https://gitlab.${me.getOrigin()}/root/${repo}`
            resolve(result)
        })
        
    }
    getToppingURL(repo) {
        let me = this;
        return new Promise((resolve, reject) => {
            let result = `https://gitlab.${me.getOrigin()}/root/topping-${repo}`
            resolve(result)
        })
    }
    getCommit(org, repo, branch) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let repoInfo = me.getRepoId(repo, org)
            .then(async function (info) {
                let file = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/commits?ref_name=${branch}`, { headers: me.getHeader() })
                .then(res => {
                    resolve(res)
                })
                .catch(err => reject(err))
            })
            .catch(e => reject(e))
        })
    }
    getHeader() {
        return {
            Authorization: 'Bearer ' + localStorage.getItem("gitToken"),
            Accept: 'application/json'
        }
    }
    getUser(org) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let userName = org ? org : localStorage.getItem('gitUserName')
            let getUserInfo = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/users?username=${userName}`)
            .then(function (res) {
                resolve(res.data[0])
            })
            .catch(e => reject(e))
        })
    }
    getRepoId(repo, org) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let userName = org ? org : localStorage.getItem('gitUserName')
            let userInfo = await me.getUser(userName)
            .then(async function (info) {
                const result = axios.get(`https://gitlab.${me.getOrigin()}/api/v4/users/${info.id}/projects?search=${repo}`, {headers: me.getHeader()})
                .then((res) => {
                    for(const repoInfo in res.data) {
                        
                        if(res.data[repoInfo].name == repo) {
                            resolve(res.data[repoInfo])
                        }
                    }
                    // console.log("*****")
                    resolve({id:null})
                })
                .catch(e => {
                    reject(e)
                })
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
    getRepo(org, repo) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let result = await me.getRepoId(repo, org)
            .then(res => {
                if(res.id == null) {
                    reject()
                } else {
                    resolve()
                }
            })
        })
    }
    getFile(repo, org, filePath, repoId) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let header = me.getHeader();
            header["Cache-Control"] = 'no-store';
            // let results = []
            // msa-ez의 경우 root에서 가지고 와야하므로 1을 부여함,
            let id = null;
            if(org.includes("msa-ez"))
                id = "root"

            if(!repoId) {
                let repoInfo = await me.getRepoId(repo, id)
                .then(function (info) {
                    repoId = info.id
                })
            }

            // let repoInfo = me.getRepoId(repo, id)
            // .then(async function (info) {
            let url = `https://gitlab.${me.getOrigin()}/api/v4/projects/${repoId}/repository/files/${encodeURIComponent(filePath)}?ref=main`
            let file = await axios.get(url, { headers: header })
            .then(res => {
                let result = {
                    data: decodeURIComponent(escape(atob(res.data.content))),
                    url: url
                }
                // let result = decodeURIComponent(escape(atob(res.data.content)))

                resolve(result)
            })
            .catch(err => {
                console.log(url)
                reject(err)   
            })
            // })
            // .catch(e => reject(e))
        })
    }
    getFiles(options) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let header = me.getHeader();
            header["Cache-Control"] = 'no-store';
            let result = []
            let repoInfo = me.getRepoId(options.repo, options.org)
            .then(async function (info) {
                let firstPage = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/tree?ref=${options.name}&id=${info.id}&page=1&per_page=100&recursive=true`, {headers: header})
                .then(async function (firstRes) {
                    result = result.concat(firstRes.data)
                    // resolve(res.data)
                    let totalPages = parseInt(firstRes.headers['x-total-pages'])
                    if(totalPages == 1) 
                        resolve(result)

                    for (var i = 2; i <= totalPages; i++) {
                        let otherPages = await axios.get(`https://gitlab.${me.getOrigin()}/api/v4/projects/${info.id}/repository/tree?ref=${options.name}&id=${info.id}&page=${i}&per_page=100&recursive=true`, {headers: header})
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
    setGitList(element, repository, gitRepoUrl) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let isToppingSetting = false
            if(gitRepoUrl.includes("topping-")){
                isToppingSetting = true
            }
            let toppingName = ""
            if(isToppingSetting){
                toppingName = repository
            }
            let gitTemplateContents = {};
            let manifestsPerTemplate = {}
            manifestsPerTemplate[gitRepoUrl] = []
            let templateFrameWorkList = {}
            let manifestsPerToppings = {}
            manifestsPerToppings[gitRepoUrl] = []
            let gitToppingList = {}
            // let result = null;
            let org = gitRepoUrl.split('/')[gitRepoUrl.split('/').length - 2].trim()
            let repo = gitRepoUrl.split('/')[gitRepoUrl.split('/').length - 1].trim()
            
            // let result = await axios.get(element.url + '?recursive=1', { headers: me.getHeader() })
            // console.log(element)
            let repoId;
            // let userId = null;
            // if(org == "root") {
            //     userId = 
            // }
            let repoInfo = await me.getRepoId(repo, org)
            .then(function (info) {
                repoId = info.id
            })
            let callCnt = 0;
            let filteredElement = element.filter(ele => ele.type != 'tree')
            filteredElement.forEach(async function (ele) {
                // let ele = filteredElement[idx]
                
                let result = await me.getFile(repo, org, ele.path, repoId)
                .then(async function(res) {
                    if(isToppingSetting){
                        try{
                            //var elePath = ele.path.replace(`${toppingName}/`, '')
                            var elePath = ele.path
                            manifestsPerToppings[gitRepoUrl].push(elePath)
                            if(!gitToppingList[gitRepoUrl]){
                                gitToppingList[gitRepoUrl] = {}
                            }
                            if(!gitToppingList[gitRepoUrl][elePath]){
                                gitToppingList[gitRepoUrl][elePath] = {}
                            }
                            gitToppingList[gitRepoUrl][elePath].requestUrl = res.url

                            // var gitSha = await axios.get(ele.url, { headers: me.githubHeaders })
                            if(!gitTemplateContents[elePath]) gitTemplateContents[elePath] = null
                            gitTemplateContents[elePath] = res.data;
                        }catch(e){
                            console.log(`Error] Set ToppingLists: ${e}`)
                        }finally {
                            callCnt ++ ;
                            console.log(filteredElement.length , callCnt)
                            if(filteredElement.length == callCnt) {
                                Object.keys(gitTemplateContents).forEach(function (fileName) {
                                    if(!gitToppingList[gitRepoUrl][fileName]){
                                        gitToppingList[gitRepoUrl][fileName] = {}
                                    }
                                    gitToppingList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                });
                                console.log(`>>> Generate Code] Topping(${gitRepoUrl}) DONE`)
                                if(ele.path.includes("helper.js")){
                                    me.loadHandleBarHelper(res.data);
                                }
                                gitTemplateContents[ele.path] = res.data;
                                let result = {
                                    gitToppingList: gitToppingList,
                                    manifestsPerToppings: manifestsPerToppings,
                                    gitTemplateContents: gitTemplateContents
                                }
                                resolve(result);
                            }
                            
                            // var gitSha = await axios.get(ele.url, { headers: me.githubHeaders });
                            // if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                            // gitTemplateContents[ele.path] = Base64.decode(gitSha.data.content);
                            
                        }
                    } else {
                        try {
                            
                            if(gitRepoUrl){
                                manifestsPerTemplate[gitRepoUrl].push('./' + ele.path)
                            }

                            if(!templateFrameWorkList[gitRepoUrl]){
                                templateFrameWorkList[gitRepoUrl] = {}
                            }
                            if(!templateFrameWorkList[gitRepoUrl][ele.path]){
                                templateFrameWorkList[gitRepoUrl][ele.path] = {}
                            }
                            templateFrameWorkList[gitRepoUrl][ele.path].requestUrl = res.url

                            // var gitSha = await axios.get(ele.url, { headers: me.githubHeaders });
                            if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                            gitTemplateContents[ele.path] = res.data;
                            
                        } catch (e) {
                            console.log(`Error] Set GitLists: ${e}`)
                        } finally {
                            let manifestsPerBaseTemplate = {}
                            callCnt++;
                            if(filteredElement.length == callCnt) {
                                manifestsPerBaseTemplate[gitRepoUrl] = manifestsPerTemplate[gitRepoUrl];
                                Object.keys(gitTemplateContents).forEach(function (fileName) {
                                    if(!templateFrameWorkList[gitRepoUrl][fileName]){
                                        templateFrameWorkList[gitRepoUrl][fileName] = {}
                                    }
                                    templateFrameWorkList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                });
                                console.log(`>>> Generate Code] Template(${gitRepoUrl}) DONE`);
                                let result = {
                                    manifestsPerBaseTemplate: manifestsPerBaseTemplate,
                                    templateFrameWorkList: templateFrameWorkList,
                                    manifestsPerTemplate: manifestsPerTemplate,
                                }
                                resolve(result);
                            }
                        }
                    }
                })
                .catch(e => {
                    callCnt++
                })
                
            })
            // let result = await me.getFile(o)
            // .then(function(res) {
            //     if( res && res.data && res.data.tree.length > 0 ) {
            //         let callCnt = 0;
            //         res.data.tree.forEach(async function (ele, idx) {
                        
            //         });
            //     } else {
            //         resolve();
            //     }
            // })
            // .catch(e => (reject(e)))
        })
    }
    loadHandleBarHelper(handler){
        try{
            if( !handler ){
                return;
            }
            (new Function(handler))();
        }catch(e){
            console.log(`Error] Load HandleBar Helper.js: ${e} `)
        }
    }
    getTree(org, repo) {
        let me = this
        return new Promise(async function (resolve, reject) {
            // TODO: 우선 Main Branch 받아오는 용도로 사용
            let treeOptions = {
                name: "main",
                repo: repo,
                org: org
            }
            let result = await me.getFiles(treeOptions)
            .then(function (res) {
                resolve(res)
            })
            .catch(e => {
                reject(e)
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