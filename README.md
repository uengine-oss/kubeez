# kuber-ez
Kuber-ez is a web-based tool for kubernetes manifest composition and operation tool in a visual way that requires minimal understanding of Yaml and CLI

## YouTube:
- Basic object editing: https://youtu.be/rVi2VNK2udM
- Istio object editing: https://youtu.be/t0utOq4dosc

## Online:
http://msaez.io or http://msaez.io/#/kubernetes/anonymous/kuberLocal/kuberInit/-init

## Snapshots:
![image](https://user-images.githubusercontent.com/48265118/88506730-902d4d00-d015-11ea-9a76-9de8e4de73b8.png)

![image](https://user-images.githubusercontent.com/48265118/88508769-8c4ff980-d01a-11ea-91f7-e9eab52c4376.png)

![image](https://user-images.githubusercontent.com/48265118/88508857-be615b80-d01a-11ea-9649-f5ddabd60445.png)

![kuberEz화면캡처2](https://user-images.githubusercontent.com/48265118/88508967-01233380-d01b-11ea-8ea9-4ae6908af7a4.png)

![image](https://user-images.githubusercontent.com/48265118/88509850-e9e54580-d01c-11ea-9167-6a82ad6da908.png)

![image](https://user-images.githubusercontent.com/48265118/88509906-fe294280-d01c-11ea-8640-0519e8ca44ca.png)

![image](https://user-images.githubusercontent.com/48265118/88513320-0ab09980-d023-11ea-9818-d5056698b8a8.png)

![image](https://user-images.githubusercontent.com/48265118/88513384-24ea7780-d023-11ea-8425-1a8a90a04351.png)


## Build and Run
### Standalone Mode

If you want to use the KuberEz for simply drawing models and generating Yaml, you only need to run front-end server:
`
npm install && npm run serve
`

### Full-fledged Mode

If you want to use KuberEz for managing your clusters, you have to run all the components of KuberEz in a Kubernetes cluster:

```
kubectl create -f kubernetes/deploy.yaml
```

## How to add new component

You can find examples of Kubernetes object models in https://github.com/uengine-oss/kuber-ez/blob/master/src/components/designer/k8s-modeling/element.
Create a new copy of element and property panel component for the K8S object kind (e.g. Deployment.vue and DeploymentPropertyPanel.vue), and place them in the above folder.
Then add the component to the 'elementTypes' array of https://github.com/uengine-oss/kuber-ez/blob/master/src/components/designer/k8s-modeling/KubeModeler.vue file.
