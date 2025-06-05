
import OneSignal from 'react-onesignal'

export const initializeOneSignal = async () => {
    if (window.OneSignal?.initialized) {
        return true
    }

    try {
        await OneSignal.init({
            appId: '5f7f6522-3c73-4d3c-91f4-2b74fbbdcba9',
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
                enable: true,
                size: 'large',
                position: 'bottom-right',
                showCredit: false,
            },
            serviceWorkerParam: {
                scope: '/'
            },
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            promptOptions: {
                slidedown: {
                    enabled: true,
                    autoPrompt: true,
                    timeDelay: 5,
                    pageViews: 1,
                    acceptButtonText: "Разрешить",
                    cancelButtonText: "Отмена",
                    actionMessage: "Хотите получать уведомления о статусе заказов?"
                }
            },
            safari_web_id: "web.onesignal.auto.5f7f6522-3c73-4d3c-91f4-2b74fbbdcba9" // Safari Web Push ID
        })

        return true
    } catch (error) {
        console.error('OneSignal error:', error)
        return false
    }
}

export const setOneSignalExternalId = async (userId) => {
    try {
        if (!window.OneSignal?.initialized) {
            await initializeOneSignal()
        }
        await OneSignal.login(userId.toString())
        return true
    } catch (error) {
        console.error('OneSignal login error:', error)
        return false
    }
} 