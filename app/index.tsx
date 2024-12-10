import {View, Text, Image, StyleSheet, Pressable} from 'react-native'
import {colors} from '../constants/colors'
import {Link} from 'expo-router'
export default function Index(){
  return(
    <View style={styles.container}>
      <Image
      source={require('../assets/images/logo.png')}
      />
      <Text style={styles.title}>
       Bem<Text style={{color:colors.grenn}}> Estar +</Text> 
      </Text>

      <Text style={styles.text}>
        Bem vindo, faça sua dieta personalizada com inteligencia artificial
      </Text>

      <Link href="/step" asChild>
        <Pressable style={styles.button}>
        <Text style={styles.buttonText}>
          Gerar sua dieta
        </Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({

   container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
   },
  title:{
    
    fontSize:36,
    fontWeight:'bold',
    color:colors.white,
    
  },
  
  text:{
    fontSize:16,
    color:colors.white,
    width:240,
    textAlign:'center',
    marginTop:8,
    marginBottom:8
  },
  
  button:{
    backgroundColor:colors.blue,
    width:'100%',
    height:48,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:8,
    marginTop:34,

  },
  
  buttonText:{
    color:colors.white,
    fontSize:18,
    fontWeight:'bold',
  }
});