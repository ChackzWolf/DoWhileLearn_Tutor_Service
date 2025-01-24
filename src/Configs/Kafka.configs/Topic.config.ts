export  const kafka_Const = {
    topics:{
        
        TUTOR_SERVICE: process.env.TUTOR_SERVICE || "tutor-service",
        TUTOR_UPDATE: process.env.TUTOR_UPDATE || "tutor.update",
        TUTOR_ROLLBACK: process.env.TUTOR_ROLLBACK || "tutor-service.rollback",
        TUTOR_RESPONSE: process.env.TUTOR_RESPONSE || "tutor.response",
        TUTOR_ROLLBACK_COMPLETED : process.env.TUTOR_ROLLBACK_COMPLETED || 'rollback-completed'
    },
    TUTOR_SERVICE_GROUP_NAME: process.env.TUTOR_SERVICE_GROUP || "tutor-service-group",
}