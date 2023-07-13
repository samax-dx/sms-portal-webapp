import royalGreen from './royalGreen';
import bdCom from './bdCom';
import link3 from './link3';

const configFileName = process.env["REACT_APP_CONFIGFILENAME_FORLOGO"];
function getAllConfig(configFileName){
    switch (configFileName.toLowerCase()){
        case 'royalgreen':
            return royalGreen;
        case 'link3':
            return link3;
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
