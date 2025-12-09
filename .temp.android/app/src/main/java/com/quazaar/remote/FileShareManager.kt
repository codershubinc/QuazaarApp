package com.quazaar.remote

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import com.quazaar.remote.api.FileShareApi
import com.quazaar.remote.api.RetrofitInstance
import com.quazaar.remote.api.UploadUrlResponse
import retrofit2.Response
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okio.BufferedSink
import okio.source

class FileShareManager(private val context: Context) {

    private val fileShareApi: FileShareApi = RetrofitInstance.fileShareApi
    private val TAG = "FileShareManager"

    suspend fun uploadFile(fileUri: Uri) {
        withContext(Dispatchers.IO) {
            try {
                // 1. Get the upload URL
                val uploadUrlResponse: Response<UploadUrlResponse> = fileShareApi.getUploadUrl()
                if (uploadUrlResponse.isSuccessful) {
                    val uploadUrl = uploadUrlResponse.body()?.acceptUri
                    if (!uploadUrl.isNullOrEmpty()) {
                        // 2. Upload the file
                        val contentResolver = context.contentResolver
                        val fileName = getFileName(fileUri)
                        
                        contentResolver.openInputStream(fileUri)?.use { inputStream ->
                            val requestFile = object : RequestBody() {
                                override fun contentType() = contentResolver.getType(fileUri)?.toMediaTypeOrNull()

                                override fun writeTo(sink: BufferedSink) {
                                    inputStream.source().use { source ->
                                        sink.writeAll(source)
                                    }
                                }
                            }

                            val body = MultipartBody.Part.createFormData("file", fileName, requestFile)

                            val uploadResponse = fileShareApi.uploadFile(uploadUrl, body)
                            if (uploadResponse.isSuccessful) {
                                // Handle successful upload
                                Log.d(TAG, "File uploaded successfully: $fileName")
                            } else {
                                // Handle upload error
                                Log.e(TAG, "File upload failed: ${uploadResponse.errorBody()?.string()}")
                            }
                        }
                    }
                } else {
                    // Handle error getting upload URL
                    Log.e(TAG, "Failed to get upload URL: ${uploadUrlResponse.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception during file upload", e)
            }
        }
    }

    private fun getFileName(uri: Uri): String {
        var result: String? = null
        if (uri.scheme == "content") {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (index >= 0) {
                        result = cursor.getString(index)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get filename", e)
            } finally {
                cursor?.close()
            }
        }
        if (result == null) {
            result = uri.path
            val cut = result?.lastIndexOf('/')
            if (cut != null && cut != -1) {
                result = result?.substring(cut + 1)
            }
        }
        return result ?: "unknown_file"
    }
}
