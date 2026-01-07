package com.quazaar.remote.api

import com.quazaar.remote.ServerResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Url

/**
 * API Interface for file sharing operations
 */
interface FileShareApi {

    /**
     * Get a temporary upload URL from the server
     */
    @GET("/api/v0.1/fileshare/create-accept-uri")
    suspend fun getUploadUrl(): Response<UploadUrlResponse>

    /**
     * Upload file to the provided URL
     */
    @Multipart
    @POST
    suspend fun uploadFile(
        @Url url: String,
        @Part file: MultipartBody.Part
    ): Response<ResponseBody>
}

/**
 * Response model for upload URL request
 */
data class UploadUrlResponse(
    val acceptUri: String
)

