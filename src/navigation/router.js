import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import AuthNavigation from './AuthNavigation/AuthNavigation'

const router = () => {
  return (
      <NavigationContainer>
         <AuthNavigation/>
      </NavigationContainer>
  )
}

export default router
