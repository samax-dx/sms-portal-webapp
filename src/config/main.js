import royalGreen from './royalGreen';
import bdCom from './bdCom';

const configFileName = "royalGreen"
function getAllConfig(configFileName){
    switch (configFileName){
        case 'royalGreen':
            return royalGreen;
        case 'bdCom':
            return bdCom;
    }
}
export default getAllConfig(configFileName)


/*

#bdcom
export const config= {
    logo: bdcom.png
}

#royal Green
export const config= {
    logo: royalGreen.png
}


#main
import bdcomConfig, royalGreen;
export function getConfig(){
    switch 'bdcom'
        return bdcomConfig.config;
            switch 'royalGreen'
                return royalGreen.config;
}*/
