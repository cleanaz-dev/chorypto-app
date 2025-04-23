import React from 'react'
import ProfilePage from '@/components/profile/ProfilePage'
import { auth } from '@clerk/nextjs/server'
import { getProfileDataByUserId } from '@/lib/actions'
import { getOrgWalletData, getUserWalletData } from '@/lib/walletService'

export default async function page() {
  const { userId } = await auth()
  const profileData = await getProfileDataByUserId(userId)
  const orgId = profileData.Organization.id
  const orgWalletData = await getOrgWalletData(orgId)

// console.log("profileData: ", profileData)

  const userWalletData = await getUserWalletData(userId)
  const userSatoshiBalance = userWalletData.balanceSatoshis

  const orgSatoshiBalance = orgWalletData.balanceSatoshis
  const walletTransactions = orgWalletData.transactions
  // console.log("Org. Wallet Satoshi Data: ", orgSatoshiBalance)
  // console.log("User Wallet Satoshi Data: ", userSatoshiBalance)
  
  const role = profileData.role

  return (
    <div>
      <ProfilePage 
          data={profileData} 
          orgWalletBalance={orgSatoshiBalance} 
          userIdSatoshiBalance={userSatoshiBalance}
          role={role} 
      />
    </div>
  )
}
